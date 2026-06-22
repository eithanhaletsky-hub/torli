import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      businessId?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    businessId?: string;
  }
}
