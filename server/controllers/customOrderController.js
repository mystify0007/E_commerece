import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendPaginated } from "../utils/ApiResponse.js";
import * as customOrderService from "../services/customOrderService.js";

export const create = asyncHandler(async (req, res) => {
  const customOrder = await customOrderService.createCustomOrder(req.user._id, req.body);
  sendSuccess(res, 201, customOrder, "Custom shoe request submitted");
});

export const listMine = asyncHandler(async (req, res) => {
  const result = await customOrderService.listMyCustomOrders(req.user._id, req.validatedQuery);
  sendPaginated(res, result);
});

export const listArtisanInbox = asyncHandler(async (req, res) => {
  const result = await customOrderService.listArtisanInbox(req.user._id, req.validatedQuery);
  sendPaginated(res, result);
});

export const getOne = asyncHandler(async (req, res) => {
  const customOrder = await customOrderService.getCustomOrderById(req.params.id, req.user);
  sendSuccess(res, 200, customOrder);
});

export const createProposal = asyncHandler(async (req, res) => {
  const proposal = await customOrderService.createProposal(req.user._id, req.params.id, req.body);
  sendSuccess(res, 201, proposal, "Proposal sent");
});

export const respondToProposal = asyncHandler(async (req, res) => {
  const result = await customOrderService.respondToProposal(req.user._id, req.params.proposalId, req.body);
  sendSuccess(res, 200, result, `Proposal ${result.proposal.status.replace("_", " ")}`);
});

export const updateStage = asyncHandler(async (req, res) => {
  const customOrder = await customOrderService.updateProductionStage(
    req.user._id,
    req.params.id,
    req.body.stage,
    req.user
  );
  sendSuccess(res, 200, customOrder, "Production status updated");
});
