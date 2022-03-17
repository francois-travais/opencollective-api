import { pick } from 'lodash';
import moment from 'moment';
import { DataTypes, Model } from 'sequelize';
import { v4 as uuid } from 'uuid';

import expenseStatus from '../constants/expense_status';
import restoreSequelizeAttributesOnClass from '../lib/restore-sequelize-attributes-on-class';
import sequelize from '../lib/sequelize';

import models, { Op } from '.';

export enum RecurringExpenseIntervals {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
}

interface RecurringExpenseAttributes {
  id: number;
  interval: RecurringExpenseIntervals;
  CollectiveId: number;
  FromCollectiveId: number;
  lastPaidAt: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

type RecurringExpenseCreateAttributes = Required<
  Pick<RecurringExpenseAttributes, 'interval' | 'CollectiveId' | 'FromCollectiveId'>
>;

export class RecurringExpense extends Model<RecurringExpenseAttributes, RecurringExpenseCreateAttributes> {
  public id: string;
  public interval: string;
  public CollectiveId: number;
  public FromCollectiveId: number;
  public lastPaidAt: Date;
  public createdAt: Date;
  public updatedAt: Date;
  public deletedAt: Date;

  public static RecurringExpenseIntervals = RecurringExpenseIntervals;

  constructor(...args) {
    super(...args);
    restoreSequelizeAttributesOnClass(new.target, this);
  }

  async getLastExpense(options = {}) {
    return models.Expense.findOne({
      ...options,
      where: { RecurringExpenseId: this.id },
      order: [['createdAt', 'DESC']],
    });
  }

  async createNextExpense() {
    const expense = await this.getLastExpense({
      include: [
        { model: models.Collective, as: 'collective' },
        { model: models.ExpenseAttachedFile, as: 'attachedFiles' },
        { model: models.ExpenseItem, as: 'items' },
      ],
    });
    const draftKey = process.env.OC_ENV === 'e2e' || process.env.OC_ENV === 'ci' ? 'draft-key' : uuid();
    const expenseFields = [
      'description',
      'longDescription',
      'tags',
      'type',
      'privateMessage',
      'invoiceInfo',
      'PayoutMethodId',
      'RecurringExpenseId',
      'UserId',
      'currency',
    ];
    const incurredAt = new Date();

    const draft = {
      ...pick(expense, expenseFields),
      FromCollectiveId: this.FromCollectiveId,
      CollectiveId: this.CollectiveId,
      lastEditedById: expense.UserId,
      incurredAt,
      amount: expense.items?.reduce((total, item) => total + item.amount, 0) || expense.amount || 1,
      data: {
        items: expense.items?.map(item => ({ ...pick(item, ['amount', 'description', 'url']), incurredAt })),
        attachedFiles: expense.attachedFiles?.map(file => pick(file, ['url'])),
        payee: { id: expense.FromCollectiveId },
        invitedByCollectiveId: this.FromCollectiveId,
        draftKey,
        payeeLocation: expense.payeeLocation,
      },
      status: expenseStatus.DRAFT,
    };

    const draftedExpense = await models.Expense.create(draft);

    // const inviteUrl = `${config.host.website}/${expense.collective.slug}/expenses/${draftedExpense.id}?key=${draft.data.draftKey}`;
    // draftedExpense
    //   .createActivity(
    //     activities.COLLECTIVE_EXPENSE_INVITE_DRAFTED,
    //     { id: expense.UserId },
    //     { ...draftedExpense.data, inviteUrl },
    //   )
    //   .catch(e => console.error('An error happened when creating the COLLECTIVE_EXPENSE_INVITE_DRAFTED activity', e));

    return draftedExpense;
  }

  static async createFromExpense(expense: typeof models.Expense, interval: RecurringExpenseIntervals) {
    const recurringExpense = await this.create({
      CollectiveId: expense.CollectiveId,
      FromCollectiveId: expense.FromCollectiveId,
      interval,
    });
    await expense.update({ RecurringExpenseId: recurringExpense.id });
    return recurringExpense;
  }

  static async getRecurringExpensesDue() {
    const dateWhere = Object.values(RecurringExpenseIntervals).map(interval => ({
      lastPaidAt: { [Op.lt]: moment().subtract(1, interval).endOf(interval) },
      interval,
    }));
    return this.findAll({
      where: { [Op.or]: dateWhere },
    });
  }
}

RecurringExpense.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
    CollectiveId: {
      type: DataTypes.INTEGER,
      references: { key: 'id', model: 'Collectives' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      allowNull: false,
    },
    FromCollectiveId: {
      type: DataTypes.INTEGER,
      references: { key: 'id', model: 'Collectives' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      allowNull: false,
    },
    interval: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        isIn: {
          args: [Object.values(RecurringExpenseIntervals)],
          msg: `Must be one of: ${Object.values(RecurringExpenseIntervals)}`,
        },
      },
    },
    lastPaidAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    paranoid: true,
    tableName: 'RecurringExpenses',
  },
);

export default RecurringExpense;
