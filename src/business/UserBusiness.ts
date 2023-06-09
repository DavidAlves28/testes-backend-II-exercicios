import { UserDatabase } from "../database/UserDatabase"
import { DeleteUserDTO, DeleteUserOutputDTO } from "../dtos/user/deleteUser.dto"
import { GetUsersInputDTO, GetUsersOutputDTO } from "../dtos/user/getUsers.dto"
import { LoginInputDTO, LoginOutputDTO } from "../dtos/user/login.dto"
import { SignupInputDTO, SignupOutputDTO } from "../dtos/user/signup.dto"
import { BadRequestError } from "../errors/BadRequestError"
import { NotFoundError } from "../errors/NotFoundError"
import { TokenPayload, USER_ROLES, User, UserDB } from "../models/User"
import { HashManager } from "../services/HashManager"
import { IdGenerator } from "../services/IdGenerator"
import { TokenManager } from "../services/TokenManager"

export class UserBusiness {
  constructor(
    private userDatabase: UserDatabase,
    private idGenerator: IdGenerator,
    private tokenManager: TokenManager,
    private hashManager: HashManager
  ) { }

  public getUsers = async (
    input: GetUsersInputDTO
  ): Promise<GetUsersOutputDTO> => {
    const { q, token } = input

    const payload = this.tokenManager.getPayload(token)

    if (payload === null) {
        throw new BadRequestError("token inválido")
    } 

    if (payload.role !== USER_ROLES.ADMIN) {
      throw new BadRequestError("somente admins podem acessar")
    }

    const usersDB = await this.userDatabase.findUsers(q)

    const users = usersDB.map((userDB) => {
      const user = new User(
        userDB.id,
        userDB.name,
        userDB.email,
        userDB.password,
        userDB.role,
        userDB.created_at
      )

      return user.toBusinessModel()
    })

    const output: GetUsersOutputDTO = users

    return output
  }

  public signup = async (
    input: SignupInputDTO
  ): Promise<SignupOutputDTO> => {
    const { name, email, password } = input

    const id = this.idGenerator.generate()
    const hashedPassword = await this.hashManager.hash(password)

    const newUser = new User(
      id,
      name,
      email,
      hashedPassword,
      USER_ROLES.NORMAL,
      new Date().toISOString()
    )

    const newUserDB = newUser.toDBModel()
    await this.userDatabase.insertUser(newUserDB)

    const tokenPayload: TokenPayload = {
      id: newUser.getId(),
      name: newUser.getName(),
      role: newUser.getRole()
    }

    const token = this.tokenManager.createToken(tokenPayload)

    const output: SignupOutputDTO = {
      message: "Cadastro realizado com sucesso",
      token: token
    }

    return output
  }

  public login = async (
    input: LoginInputDTO
  ): Promise<LoginOutputDTO> => {
    const { email, password } = input

    const userDB = await this.userDatabase.findUserByEmail(email)

    if (!userDB) {
      throw new NotFoundError("'email' não encontrado")
    }

    const hashedPassword = userDB.password

    const isPasswordCorrect = await this.hashManager.compare(password, hashedPassword)

    if (!isPasswordCorrect) {
      throw new BadRequestError("'email' ou 'password' incorretos")
    }

    const user = new User(
      userDB.id,
      userDB.name,
      userDB.email,
      userDB.password,
      userDB.role,
      userDB.created_at
    )

    const tokenPayload: TokenPayload = {
      id: user.getId(),
      name: user.getName(),
      role: user.getRole()
    }

    const token = this.tokenManager.createToken(tokenPayload)

    const output: LoginOutputDTO = {
      message: "Login realizado com sucesso",
      token: token
    }

    return output
  }

  // delete user by id 
  public deleteUser = async (
    input:DeleteUserDTO
  ): Promise<DeleteUserOutputDTO> => {
    const {  q , token } = input
    
    const payload = this.tokenManager.getPayload(token)

    if (payload === null) {
        throw new BadRequestError("token inválido")
    } 

    if (payload.role !== USER_ROLES.ADMIN) {
      throw new BadRequestError("somente admins podem acessar")
    }
    const usersDB = await this.userDatabase.findUserById(q)

    if(!usersDB){
      throw new BadRequestError("'id' incorreto ou usuário não existe.")
      
    }
    await this.userDatabase.deleteUserById(q)

    const output: DeleteUserOutputDTO = {
    message:"Usuário deletado com sucesso!"
    }

    return output
  }

  // retorna uma user
  public getUserById = async (
    input: GetUsersInputDTO
  ): Promise<GetUsersOutputDTO | undefined > => {
    const { q, token } = input

    const payload = this.tokenManager.getPayload(token)

    if (payload === null) {
        throw new BadRequestError("token inválido")
    } 

    if (payload.role !== USER_ROLES.ADMIN) {
      throw new BadRequestError("somente admins podem acessar")
    }

    const usersDB = await this.userDatabase.findUserById(q)
    if(!usersDB){
      throw new BadRequestError("id invalído")

    }
    
      const user = new User(
        usersDB.id,
        usersDB.name,
        usersDB.email,
        usersDB.password,
        usersDB.role,
        usersDB.created_at
      )

    
    

    const output = user.toBusinessModel()
    return output as any
  }

}