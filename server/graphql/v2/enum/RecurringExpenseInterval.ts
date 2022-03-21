import { GraphQLEnumType } from 'graphql';

import { RecurringExpenseIntervals } from '../../../models/RecurringExpense';

export const RecurringExpenseInterval = new GraphQLEnumType({
  name: 'RecurringExpenseInterval',
  description: 'All supported intervals for recurring expenses',
  values: Object.keys(RecurringExpenseIntervals).reduce(
    (values, key) => ({ ...values, [key]: { value: RecurringExpenseIntervals[key] } }),
    {},
  ),
});
