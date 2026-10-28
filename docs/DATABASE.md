# Database notes

## Vector indexes are managed by hand

`JobEmbedding.embedding` and `ResumeBlock.embedding` have HNSW indexes created in the init migration. Prisma cannot represent them in `schema.prisma`, so every `prisma migrate dev` will generate:

    DROP INDEX "JobEmbedding_embedding_hnsw_idx";
    DROP INDEX "ResumeBlock_embedding_hnsw_idx";

Delete those lines from the generated migration.sql before applying it. Never accept them.

## Local setup

Postgres runs from docker-compose.yml on host port 5433 (5432 is often taken by a local install).