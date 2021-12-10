import DataLoader from 'dataloader';
import express from 'express';

import ACTIVITY from '../../constants/activities';
import queries from '../../lib/queries';
import models, { Op, sequelize } from '../../models';
import { ExpenseAttachedFile } from '../../models/ExpenseAttachedFile';
import { ExpenseItem } from '../../models/ExpenseItem';
import { LEGAL_DOCUMENT_TYPE } from '../../models/LegalDocument';

import { sortResultsArray, sortResultsSimple } from './helpers';

/**
 * Loader for expense's items.
 */
export const generateExpenseItemsLoader = (): DataLoader<number, ExpenseItem[]> => {
  return new DataLoader(async (expenseIds: number[]) => {
    const items = await models.ExpenseItem.findAll({
      where: { ExpenseId: { [Op.in]: expenseIds } },
    });

    return sortResultsArray(expenseIds, items, item => item.ExpenseId);
  });
};

/**
 * Load all activities for an expense
 */
export const generateExpenseActivitiesLoader = (req: express.Request): DataLoader<number, typeof models.Activity> => {
  return new DataLoader(async (expenseIDs: number[]) => {
    // Optimization: load expenses to get their collective IDs, as filtering on `data` (JSON)
    // can be expensive.
    const expenses = await req.loaders.Expense.byId.loadMany(expenseIDs);
    const collectiveIds = expenses.map(expense => expense.CollectiveId);
    const activities = await models.Activity.findAll({
      order: [['createdAt', 'ASC']],
      where: {
        CollectiveId: {
          [Op.in]: collectiveIds,
        },
        ExpenseId: {
          [Op.in]: expenseIDs,
        },
        type: {
          [Op.in]: [
            ACTIVITY.COLLECTIVE_EXPENSE_CREATED,
            ACTIVITY.COLLECTIVE_EXPENSE_DELETED,
            ACTIVITY.COLLECTIVE_EXPENSE_UPDATED,
            ACTIVITY.COLLECTIVE_EXPENSE_INVITE_DRAFTED,
            ACTIVITY.COLLECTIVE_EXPENSE_REJECTED,
            ACTIVITY.COLLECTIVE_EXPENSE_APPROVED,
            ACTIVITY.COLLECTIVE_EXPENSE_UNAPPROVED,
            ACTIVITY.COLLECTIVE_EXPENSE_PAID,
            ACTIVITY.COLLECTIVE_EXPENSE_MARKED_AS_UNPAID,
            ACTIVITY.COLLECTIVE_EXPENSE_PROCESSING,
            ACTIVITY.COLLECTIVE_EXPENSE_ERROR,
            ACTIVITY.COLLECTIVE_EXPENSE_SCHEDULED_FOR_PAYMENT,
            ACTIVITY.COLLECTIVE_EXPENSE_MARKED_AS_SPAM,
          ],
        },
      },
    });

    return sortResultsArray(expenseIDs, activities, activity => activity.data.expense.id);
  });
};

/**
 * Loader for expense's attachedFiles.
 */
export const attachedFiles = (): DataLoader<number, ExpenseAttachedFile[]> => {
  return new DataLoader(async (expenseIds: number[]) => {
    const attachedFiles = await models.ExpenseAttachedFile.findAll({
      where: { ExpenseId: { [Op.in]: expenseIds } },
    });

    return sortResultsArray(expenseIds, attachedFiles, file => file.ExpenseId);
  });
};

/**
 * Expense loader to check if userTaxForm is required before expense payment
 */
export const userTaxFormRequiredBeforePayment = (): DataLoader<number, boolean> => {
  return new DataLoader<number, boolean>(async (expenseIds: number[]): Promise<boolean[]> => {
    const expenseIdsPendingTaxForm = await queries.getTaxFormsRequiredForExpenses(expenseIds);
    return expenseIds.map(id => expenseIdsPendingTaxForm.has(id));
  });
};

/**
 * Loader for expense's requiredLegalDocuments.
 */
export const requiredLegalDocuments = (): DataLoader<number, string[]> => {
  return new DataLoader(async (expenseIds: number[]) => {
    const expenseIdsPendingTaxForm = await queries.getTaxFormsRequiredForExpenses(expenseIds);
    return expenseIds.map(id => (expenseIdsPendingTaxForm.has(id) ? [LEGAL_DOCUMENT_TYPE.US_TAX_FORM] : []));
  });
};

/**
 * Loader for expense's host.
 */
export const host = (): DataLoader<number, typeof models.Collective> => {
  return new DataLoader(async (expenseIds: number[]) => {
    const results = await sequelize.query(
      `
      SELECT e.id AS __expense_id__, host.*
      FROM "Expenses" e
      INNER JOIN "Collectives" expense_collective
        ON e."CollectiveId" = expense_collective.id
      INNER JOIN "Collectives" host
        ON (e."HostCollectiveId" = host.id)
        OR (expense_collective."HostCollectiveId" = host.id AND expense_collective."isActive" IS TRUE)
      WHERE e.id IN (:expenseIds)
    `,
      {
        type: sequelize.QueryTypes.SELECT,
        mapToModel: true,
        model: models.Collective,
        replacements: { expenseIds },
      },
    );

    return sortResultsSimple(expenseIds, results, r => r.dataValue.__expense_id__);
  });
};
