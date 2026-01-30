import * as users from './usersQueries'
import * as session from './sessionQueries'

export const queries = {
    users,
    session,
} as const