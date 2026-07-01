import * as bcrypt from 'bcrypt';
import dataSource from './data-source';
import { User } from '../../modules/users/infra/data/typeorm/user.entity';

async function seed() {
  await dataSource.initialize();

  const userRepository = dataSource.getRepository(User);

  const existing = await userRepository.findOne({
    where: { nickname: 'aivacol' },
  });

  if (existing) {
    console.log('Usuário "aivacol" já existe, seed ignorado.');
    await dataSource.destroy();
    return;
  }

  const hashedPassword = await bcrypt.hash('Aivacol@2026', 10);

  const user = userRepository.create({
    nickname: 'aivacol',
    name: 'Aivacol Admin',
    email: 'admin@aivacol.com',
    password: hashedPassword,
    createdBy: 'seed',
  });

  await userRepository.save(user);

  console.log('Usuário "aivacol" criado com sucesso.');
  console.log('Login: aivacol / Senha: Aivacol@2026');

  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('Erro ao rodar seed:', error);
  process.exit(1);
});
