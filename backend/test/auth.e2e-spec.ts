import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { todayInDakar } from '../src/common/dakar-date';
import { PrismaService } from '../src/prisma/prisma.service';

// Nécessite la base PostGIS démarrée (docker compose up -d db).
// Les données de test utilisent des codes 99xxxx-xx et sont supprimées après chaque test.
const TEST_CODE_PREFIX = '99';

const volunteer = {
  firstName: 'Awa',
  lastName: 'Fall',
  code: '990001-00',
  phone: '78 999 00 01',
};

function sessionCookie(res: request.Response): string {
  const cookies = res.get('Set-Cookie') ?? [];
  const cookie = cookies.find((c) => c.startsWith('geocheckin_session='));
  if (!cookie) throw new Error('Session cookie missing');
  return cookie;
}

describe('Volunteer sign-up and login (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  async function cleanUp(): Promise<void> {
    const where = { volunteer: { code: { startsWith: TEST_CODE_PREFIX } } };
    await prisma.attendance.deleteMany({ where });
    await prisma.volunteer.deleteMany({
      where: { code: { startsWith: TEST_CODE_PREFIX } },
    });
  }

  // Application recréée à chaque test pour repartir d'un compteur de rate limit vide.
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);
    await cleanUp();
  });

  afterEach(async () => {
    await cleanUp();
    await app.close();
  });

  it('sign-up → me → logout', async () => {
    const signUp = await request(app.getHttpServer())
      .post('/volunteers')
      .send(volunteer)
      .expect(201);
    expect(signUp.body).toEqual({
      code: '990001-00',
      firstName: 'Awa',
      lastName: 'Fall',
    });

    const cookie = sessionCookie(signUp);
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/SameSite=Strict/);

    const stored = await prisma.volunteer.findUnique({
      where: { code: '990001-00' },
    });
    expect(stored?.phone).toBe('+221789990001');

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', cookie)
      .expect(200)
      .expect({
        code: '990001-00',
        firstName: 'Awa',
        lastName: 'Fall',
        checkedInToday: false,
      });

    const logout = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Cookie', cookie)
      .expect(204);
    expect(sessionCookie(logout)).toMatch(/Expires=Thu, 01 Jan 1970/);
  });

  it('login with a registered code opens a session', async () => {
    await request(app.getHttpServer()).post('/volunteers').send(volunteer);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ code: '990001-00' })
      .expect(200);

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', sessionCookie(login))
      .expect(200);
  });

  it('login with an unknown code returns VOLUNTEER_NOT_FOUND', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ code: '990404-00' })
      .expect(404);
    expect(res.body).toMatchObject({ error: 'VOLUNTEER_NOT_FOUND' });
  });

  it('returns 409 when the code or phone is already registered', async () => {
    await request(app.getHttpServer()).post('/volunteers').send(volunteer);

    const res = await request(app.getHttpServer())
      .post('/volunteers')
      .send({ ...volunteer, code: '990002-00' })
      .expect(409);
    expect(res.body).toMatchObject({
      error: 'VOLUNTEER_ALREADY_EXISTS',
      fields: ['phone'],
    });
  });

  it('returns 400 on invalid formats and unknown fields', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ code: '01234600' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/volunteers')
      .send({ ...volunteer, phone: '721234567' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/volunteers')
      .send({ ...volunteer, isAdmin: true })
      .expect(400);
  });

  it('returns 401 on /auth/me without or with an invalid cookie', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', 'geocheckin_session=forged.token.value')
      .expect(401);
  });

  it('reports checkedInToday when an attendance exists today', async () => {
    const signUp = await request(app.getHttpServer())
      .post('/volunteers')
      .send(volunteer);
    const stored = await prisma.volunteer.findUniqueOrThrow({
      where: { code: '990001-00' },
    });
    await prisma.$executeRaw`
      INSERT INTO "Attendance" (id, "volunteerId", date, "photoUrl", "signatureUrl", location)
      VALUES (gen_random_uuid(), ${stored.id}, ${todayInDakar()}::date, 'p', 's',
              ST_SetSRID(ST_MakePoint(-17.2, 14.7), 4326))`;

    const me = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', sessionCookie(signUp))
      .expect(200);
    expect(me.body).toMatchObject({ checkedInToday: true });
  });

  it('rate limits /auth/login with 429', async () => {
    const limit = Number(process.env.THROTTLE_LIMIT ?? 30);
    for (let i = 0; i < limit; i++) {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ code: '990404-00' })
        .expect(404);
    }
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ code: '990404-00' })
      .expect(429);
  });
});
