from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base

# engine creation
engine = create_async_engine('sqlite+aiosqlite:///vsdc.db', echo=True)

# SessionLocal
asyncSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False)

#Base
Base = declarative_base()

#Helper function to get database sessions
async def get_session():
    async with asyncSessionLocal() as session:
        yield session