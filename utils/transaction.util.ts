import { DataSource, QueryRunner } from 'typeorm';

/**
 * Executes an operation within a transaction context.
 * If a QueryRunner is provided, uses its transaction context.
 * Otherwise, creates a new transaction using the DataSource.
 *
 * @param operation The operation to execute within the transaction
 * @param dataSource The DataSource to use for creating new transactions
 * @param existingQueryRunner Optional QueryRunner with an existing transaction context
 * @returns The result of the operation
 */
export async function executeInTransaction<T>(
  operation: (queryRunner: QueryRunner) => Promise<T>,
  dataSource: DataSource,
  existingQueryRunner?: QueryRunner,
): Promise<T> {
  // If we have an existing QueryRunner, use it
  if (existingQueryRunner) {
    return operation(existingQueryRunner);
  }

  // Otherwise create a new transaction
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const result = await operation(queryRunner);
    await queryRunner.commitTransaction();
    return result;
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }
}
