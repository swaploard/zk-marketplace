import { authConfig } from '../../../auth';
import { getServerSession } from 'next-auth';

const serverSessionProvider = async () => {
  const session = await getServerSession(authConfig);
  return session;
};

export default serverSessionProvider;
