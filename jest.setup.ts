beforeAll(async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterAll(async () => {
  jest.restoreAllMocks()
})
