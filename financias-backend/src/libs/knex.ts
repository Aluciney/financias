import { knexfile } from '@root/knexfile'
import Knex from 'knex'
import { attachPaginate } from 'knex-paginate'

const configFinancias = knexfile.financias
const knexFinancias = Knex(configFinancias)
attachPaginate()

export { knexFinancias }
