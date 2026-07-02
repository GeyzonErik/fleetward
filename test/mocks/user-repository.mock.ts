export function createMockUserRepository() {
  return {
    findOne: jest.fn(),
  };
}
