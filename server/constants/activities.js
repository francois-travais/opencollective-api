/*
 * Constant strings used in the activity model
 */

export default {
  ACTIVITY_ALL: 'all',
  CONNECTED_ACCOUNT_CREATED: 'connected_account.created',
  COLLECTIVE_CREATED_GITHUB: 'collective.created.github',
  COLLECTIVE_APPLY: 'collective.apply',
  COLLECTIVE_APPROVED: 'collective.approved',
  COLLECTIVE_REJECTED: 'collective.rejected',
  COLLECTIVE_CREATED: 'collective.created',
  COLLECTIVE_COMMENT_CREATED: 'collective.comment.created',
  COLLECTIVE_CONVERSATION_CREATED: 'collective.conversation.created',
  COLLECTIVE_EXPENSE_CREATED: 'collective.expense.created',
  COLLECTIVE_EXPENSE_DELETED: 'collective.expense.deleted',
  COLLECTIVE_EXPENSE_UPDATED: 'collective.expense.updated',
  COLLECTIVE_EXPENSE_REJECTED: 'collective.expense.rejected',
  COLLECTIVE_EXPENSE_APPROVED: 'collective.expense.approved',
  COLLECTIVE_EXPENSE_UNAPPROVED: 'collective.expense.unapproved',
  COLLECTIVE_EXPENSE_PAID: 'collective.expense.paid',
  COLLECTIVE_EXPENSE_MARKED_AS_UNPAID: 'collective.expense.unpaid',
  COLLECTIVE_EXPENSE_MARKED_AS_SPAM: 'collective.expense.spam',
  COLLECTIVE_EXPENSE_PROCESSING: 'collective.expense.processing',
  COLLECTIVE_EXPENSE_SCHEDULED_FOR_PAYMENT: 'collective.expense.scheduledForPayment',
  COLLECTIVE_EXPENSE_ERROR: 'collective.expense.error',
  COLLECTIVE_EXPENSE_INVITE_DRAFTED: 'collective.expense.invite.drafted',
  COLLECTIVE_EXPENSE_MISSING_RECEIPT: 'collective.expense.missing.receipt',
  COLLECTIVE_MEMBER_CREATED: 'collective.member.created',
  COLLECTIVE_TRANSACTION_CREATED: 'collective.transaction.created',
  COLLECTIVE_UPDATE_CREATED: 'collective.update.created',
  COLLECTIVE_UPDATE_PUBLISHED: 'collective.update.published',
  COLLECTIVE_CONTACT: 'collective.contact',
  COLLECTIVE_VIRTUAL_CARD_ADDED: 'collective.virtualcard.added',
  ORGANIZATION_COLLECTIVE_CREATED: 'organization.collective.created',
  SUBSCRIPTION_ACTIVATED: 'subscription.activated',
  SUBSCRIPTION_CONFIRMED: 'subscription.confirmed',
  SUBSCRIPTION_CANCELED: 'subscription.canceled',
  TICKET_CONFIRMED: 'ticket.confirmed',
  USER_CREATED: 'user.created',
  WEBHOOK_STRIPE_RECEIVED: 'webhook.stripe.received',
  WEBHOOK_PAYPAL_RECEIVED: 'webhook.paypal.received',
  COLLECTIVE_MONTHLY: 'collective.monthly',
  ORDERS_SUSPICIOUS: 'orders.suspicious',
  BACKYOURSTACK_DISPATCH_CONFIRMED: 'backyourstack.dispatch.confirmed',
  ACTIVATED_COLLECTIVE_AS_HOST: 'activated.collective.as.host',
  ACTIVATED_COLLECTIVE_AS_INDEPENDENT: 'activated.collective.as.independent',
  DEACTIVATED_COLLECTIVE_AS_HOST: 'deactivated.collective.as.host',
  VIRTUAL_CARD_REQUESTED: 'virtual_card.requested',

  // Not used anymore, leaving for historical reference
  ADDED_FUND_TO_ORG: 'added.fund.to.org',
  COLLECTIVE_TRANSACTION_PAID: 'collective.transaction.paid', // replaced with COLLECTIVE_EXPENSE_PAID
  COLLECTIVE_USER_ADDED: 'collective.user.added',
  COLLECTIVE_VIRTUAL_CARD_ASSIGNED: 'collective.virtualcard.assigned', // replaced with COLLECTIVE_VIRTUAL_CARD_ADDED
  COLLECTIVE_VIRTUAL_CARD_CREATED: 'collective.virtualcard.created', // replaced with COLLECTIVE_VIRTUAL_CARD_ADDED
};
