import {
  DeleteUsersSchema,
} from "../../src/dtos/user/deleteUser.dto";
import { UserBusiness } from "../../src/business/UserBusiness";
import { HashManagerMock } from "../mocks/HashManagerMock";
import { IdGeneratorMock } from "../mocks/IdGeneratorMock";
import { TokenManagerMock } from "../mocks/TokenManagerMock";
import { UserDatabaseMock } from "../mocks/UserDatabaseMock";

describe("Teste Business delete USer", () => {
  const userBusiness = new UserBusiness(
    new UserDatabaseMock(),
    new IdGeneratorMock(),
    new TokenManagerMock(),
    new HashManagerMock()
  );

  test("deve retornar mensagem de deletado com sucesso!", async () => {
    const input = DeleteUsersSchema.parse({
      q :"id-mock-fulano",
      token: "token-mock-astrodev"
    });
    const output = await userBusiness.deleteUser(input)
    expect(output).toEqual({
      message:"Usuário deletado com sucesso!"
    })
  });
});
