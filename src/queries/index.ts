import * as users from './usersQueries'
import * as session from './sessionQueries'
import * as project from './projectQueries'
import * as layer from './layerQueries'

export const queries = {
    users,
    session,
    project,
    layer,
} as const