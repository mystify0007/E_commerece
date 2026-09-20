import { CustomOrder, STAGE_TRANSITIONS } from "../models/CustomOrder.js";
import { CustomProposal } from "../models/CustomProposal.js";
import { Artisan } from "../models/Artisan.js";
import { ApiError } from "../utils/ApiError.js";
import { parsePagination } from "../utils/paginate.js";
import { getArtisanProfileByUserId, assertArtisanCanSell } from "./artisanService.js";
import { createNotification } from "./notificationService.js";

const PRODUCTION_ONLY_STAGES = [
  "material_preparation",
  "crafting",
  "quality_check",
  "ready_for_shipment",
  "shipped",
  "delivered",
];

export async function createCustomOrder(customerId, payload) {
  const customOrder = await CustomOrder.create({ ...payload, customer: customerId });

  if (customOrder.targetArtisan) {
    const artisan = await Artisan.findById(customOrder.targetArtisan);
    if (artisan) {
      await createNotification({
        user: artisan.user,
        type: "custom_request",
        title: "New custom shoe request",
        message: `A customer has requested a custom ${customOrder.shoeType}.`,
        relatedEntityType: "CustomOrder",
        relatedEntity: customOrder._id,
      });
    }
  }

  return customOrder;
}

export async function listMyCustomOrders(customerId, { page, limit }) {
  const { skip, limit: pageLimit, page: p } = parsePagination({ page, limit });
  const [items, total] = await Promise.all([
    CustomOrder.find({ customer: customerId }).sort({ createdAt: -1 }).skip(skip).limit(pageLimit),
    CustomOrder.countDocuments({ customer: customerId }),
  ]);
  return { items, total, page: p, limit: pageLimit };
}

export async function listArtisanInbox(userId, { page, limit }) {
  const artisan = await getArtisanProfileByUserId(userId);
  const { skip, limit: pageLimit, page: p } = parsePagination({ page, limit });

  const query = {
    $or: [{ targetArtisan: artisan._id }, { targetArtisan: null, status: "request_submitted" }],
  };

  const [items, total] = await Promise.all([
    CustomOrder.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageLimit),
    CustomOrder.countDocuments(query),
  ]);
  return { items, total, page: p, limit: pageLimit };
}

async function loadAccessibleCustomOrder(customOrderId, requester) {
  const customOrder = await CustomOrder.findById(customOrderId);
  if (!customOrder) throw ApiError.notFound("Custom order not found");

  const isOwner = customOrder.customer.toString() === requester._id.toString();
  const isAdmin = requester.role === "admin";
  let isEligibleArtisan = false;

  if (!isOwner && !isAdmin && requester.role === "artisan") {
    const artisan = await Artisan.findOne({ user: requester._id });
    isEligibleArtisan =
      artisan &&
      (customOrder.targetArtisan?.toString() === artisan._id.toString() ||
        (customOrder.targetArtisan === null && customOrder.status === "request_submitted"));
  }

  if (!isOwner && !isAdmin && !isEligibleArtisan) {
    throw ApiError.forbidden("You do not have access to this custom order");
  }

  return customOrder;
}

export async function getCustomOrderById(customOrderId, requester) {
  const customOrder = await loadAccessibleCustomOrder(customOrderId, requester);
  const proposals = await CustomProposal.find({ customOrder: customOrder._id })
    .sort({ createdAt: -1 })
    .populate({ path: "artisan", select: "shopName ratingAvg" });
  return { ...customOrder.toObject(), proposals };
}

export async function createProposal(userId, customOrderId, payload) {
  const artisan = await getArtisanProfileByUserId(userId);
  assertArtisanCanSell(artisan);

  const customOrder = await CustomOrder.findById(customOrderId);
  if (!customOrder) throw ApiError.notFound("Custom order not found");

  if (customOrder.targetArtisan && customOrder.targetArtisan.toString() !== artisan._id.toString()) {
    throw ApiError.forbidden("This request was addressed to a different artisan");
  }
  if (!["request_submitted", "design_review"].includes(customOrder.status)) {
    throw ApiError.badRequest(`Cannot submit a proposal while the request is "${customOrder.status}"`);
  }

  const proposal = await CustomProposal.create({ customOrder: customOrder._id, artisan: artisan._id, ...payload });

  customOrder.targetArtisan = artisan._id; // locks the request to whichever artisan responds first
  customOrder.status = "proposal_sent";
  await customOrder.save();

  await createNotification({
    user: customOrder.customer,
    type: "custom_proposal",
    title: "You have a custom design proposal",
    message: `${artisan.shopName} sent a proposal for your custom ${customOrder.shoeType} request.`,
    relatedEntityType: "CustomOrder",
    relatedEntity: customOrder._id,
  });

  return proposal;
}

export async function respondToProposal(userId, proposalId, { action, customerNote }) {
  const proposal = await CustomProposal.findById(proposalId).populate("artisan", "user shopName");
  if (!proposal) throw ApiError.notFound("Proposal not found");

  const customOrder = await CustomOrder.findById(proposal.customOrder);
  if (!customOrder || customOrder.customer.toString() !== userId.toString()) {
    throw ApiError.forbidden("You do not have access to this proposal");
  }
  if (proposal.status !== "pending") {
    throw ApiError.badRequest("This proposal has already been responded to");
  }

  proposal.customerNote = customerNote;

  if (action === "accept") {
    proposal.status = "accepted";
    customOrder.status = "customer_approved";
    customOrder.acceptedProposal = proposal._id;
  } else if (action === "reject") {
    proposal.status = "rejected";
    customOrder.status = "rejected";
  } else {
    proposal.status = "revision_requested";
    customOrder.status = "design_review"; // same artisan may submit a revised proposal
  }

  await proposal.save();
  await customOrder.save();

  await createNotification({
    user: proposal.artisan.user,
    type: "proposal_accepted",
    title: `Proposal ${proposal.status.replace("_", " ")}`,
    message: `Your proposal for a custom ${customOrder.shoeType} was ${proposal.status.replace("_", " ")}.`,
    relatedEntityType: "CustomOrder",
    relatedEntity: customOrder._id,
  });

  return { proposal, customOrder };
}

export async function updateProductionStage(userId, customOrderId, stage, requester) {
  const customOrder = await CustomOrder.findById(customOrderId);
  if (!customOrder) throw ApiError.notFound("Custom order not found");

  const isAdmin = requester.role === "admin";
  let isAssignedArtisan = false;
  if (!isAdmin && requester.role === "artisan") {
    const artisan = await Artisan.findOne({ user: userId });
    isAssignedArtisan = artisan && customOrder.targetArtisan?.toString() === artisan._id.toString();
  }
  if (!isAdmin && !isAssignedArtisan) {
    throw ApiError.forbidden("Only the assigned artisan can update production status");
  }
  if (!PRODUCTION_ONLY_STAGES.includes(stage) && stage !== "cancelled") {
    throw ApiError.badRequest(`"${stage}" cannot be set directly — it is reached through the proposal workflow`);
  }

  const allowedNext = STAGE_TRANSITIONS[customOrder.status] || [];
  if (!isAdmin && !allowedNext.includes(stage)) {
    throw ApiError.badRequest(`Cannot move from "${customOrder.status}" to "${stage}"`);
  }

  customOrder.status = stage;
  await customOrder.save();

  await createNotification({
    user: customOrder.customer,
    type: "production_status_change",
    title: "Production update",
    message: `Your custom ${customOrder.shoeType} is now "${stage.replace(/_/g, " ")}".`,
    relatedEntityType: "CustomOrder",
    relatedEntity: customOrder._id,
  });

  return customOrder;
}
