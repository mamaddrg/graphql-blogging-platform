import type { PrismaClient } from "@prisma/client"

export type AppContextModel = {
  dbClient: PrismaClient
}