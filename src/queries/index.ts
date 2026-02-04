import * as users from './usersQueries'
import * as session from './sessionQueries'
import * as project from './projectQueries'

export const queries = {
    users,
    session,
    project,
} as const