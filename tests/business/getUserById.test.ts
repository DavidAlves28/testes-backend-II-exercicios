import { UserBusiness } from "../../src/business/UserBusiness"
import { GetUsersSchema } from "../../src/dtos/user/getUsers.dto"
import { LoginSchema } from "../../src/dtos/user/login.dto"
import { USER_ROLES } from "../../src/models/User"
import { HashManagerMock } from "../mocks/HashManagerMock"
import { IdGeneratorMock } from "../mocks/IdGeneratorMock"
import { TokenManagerMock } from "../mocks/TokenManagerMock"
import { UserDatabaseMock } from "../mocks/UserDatabaseMock"


describe("Testando getUsersById", () => {
  const userBusiness = new UserBusiness(
    new UserDatabaseMock(),
    new IdGeneratorMock(),
    new TokenManagerMock(),
    new HashManagerMock()
  )

  test("deve retornar um user pelo seu id  ", async () => {
    const input = GetUsersSchema.parse({
        q:"id-mock-astrodev",
      token: "token-mock-astrodev"
    })

    const output = await userBusiness.getUserById(input)

    
    expect(output).toEqual({
      id: "id-mock-astrodev",
      name: "Astrodev",
      email: "astrodev@email.com",
      createdAt: expect.any(String),
      role: USER_ROLES.ADMIN
    })
  })
})