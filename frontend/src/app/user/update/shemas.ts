import { z } from 'zod';

export const profileFormSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  bio: z.string().min(1, 'Bio is required'),
  email: z.string().email(),
  links: z.string().url().optional().or(z.literal('')),
  profileImage: z.string(),
  profileBanner: z.string(),
  walletAddress: z.string(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
