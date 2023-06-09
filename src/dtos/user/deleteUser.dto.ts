import z from "zod"


export interface DeleteUserDTO {
  q: string,  
  token: string,
}

export type DeleteUserOutputDTO = {
message:string;
}

export const DeleteUsersSchema = z.object({
  q: z.string().min(1),
  token: z.string().min(1)
}).transform(data => data as DeleteUserDTO)