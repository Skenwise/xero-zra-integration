from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime, timezone
from ..db.database import get_session
from helpers import log_message, generate_idempotency_key, normalize_amount
from ..db.models import QueueSale 
import json

class queueManager:
    def __init__(self, session: AsyncSession=Depends(get_session)):
        self.session = session

        async def addToQueue(self, invoice: dict, saleType: str="Normal"):
            try:
                idempotency_key = generate_idempotency_key(prefix="sale")

                payload_json = json.dumps(invoice)

                new_queue_item = QueueSale(
                    saleType=saleType,
                    status = "PENDING",
                    attempts=0,
                    lastAttempt=None,
                    createdAt = datetime.now(timezone.utc),
                    updatedAt = datetime.now(timezone.utc),
                    idempotencyKey = idempotency_key,
                   payload = payload_json 
                )

                self.session.add(new_queue_item)
                await self.session.commit()
                await self.session.refresh(new_queue_item)

                log_message(f"[QUEUE] Sale queued with ID={new_queue_item.id}, key={idempotency_key}", level="info")

                return {
                    "success": True,
                    "queueId": new_queue_item.id,
                    "idempotencyKey": idempotency_key
                }
            
            except SQLAlchemyError as e:
                await self.session.rollback()
                log_message(f"[QUEUE ERROR] Failed to queue sale: {str(e)}")

                return {
                    "success": False,
                    "error": "Failed to queue sale"
                }


        async def getNextPending(self):
            pass

        async def markProcessing(self, queue_id: int):
            pass

        async def markSuccess(self, queue_id: int):
            pass

        async def markFailed(self, queue_id: int, error: str):
            pass

        async def incrementAttempts(self, queue_id: int):
            pass

        async def retryableJobs(self):
            pass 
            
