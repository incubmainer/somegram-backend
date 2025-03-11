export class UserCreatedDto {
  username: string;
  email: string;
  hashPassword: string;
  createdAt: Date;
  confirmationToken: string;
  confirmationTokenExpiresAt: Date;
  isConfirmed: boolean;
}

export class UserCreatedByGoogleDto {
  username: string;
  email: string;
  createdAt: Date;
  isConfirmed: boolean;
}

export class UserGoogleInfoCreatedDto {
  userId: string | null;
  subGoogleId: string;
  googleEmail: string;
  googleEmailVerified: boolean;
}

export class UserGitHubInfoCreatedDto {
  userId: string;
  githubId: string;
  email: string;
  userName: string;
  displayName: string;
}

export class UserCreatedByGithubDto {
  username: string;
  email: string;
  createdAt: Date;
  isConfirmed: boolean;
  firstName: string;
}
