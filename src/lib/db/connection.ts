import { drizzle } from "drizzle-orm/d1"
import * as schema from "./schema"

// Cloudflare D1 Database type
declare global {
  interface D1Database {
    prepare(query: string): D1PreparedStatement
    dump(): Promise<ArrayBuffer>
    batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>
    exec(query: string): Promise<D1ExecResult>
  }

  interface D1PreparedStatement {
    bind(...values: any[]): D1PreparedStatement
    first<T = unknown>(): Promise<T | null>
    run(): Promise<D1Result>
    all<T = unknown>(): Promise<D1Result<T>>
  }

  interface D1Result<T = unknown> {
    results?: T[]
    success: boolean
    meta: {
      changed_db: boolean
      changes: number
      duration: number
      last_row_id: number
      rows_read: number
      rows_written: number
      size_after: number
    }
  }

  interface D1ExecResult {
    count: number
    duration: number
  }
}

// This will be used in API routes to connect to the database
export function getDb(env: { DB: D1Database }) {
  return drizzle(env.DB, { schema })
}

// Types for the database connection
export type DbConnection = ReturnType<typeof getDb>
