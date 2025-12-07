import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetCurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    // The Guard (AtStrategy) attached the user object here
    if (!data) return request.user;
    return request.user[data];
  }
);
