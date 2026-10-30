"""Celery application configuration for WiseHaven background tasks.

Workers connect to Redis as both the message broker and result backend.
The beat scheduler triggers periodic tasks (e.g. lock-maturity monitor).

Start the worker:
    celery -A tasks.celery_app worker --loglevel=info

Start the beat scheduler (separate process):
    celery -A tasks.celery_app beat --loglevel=info

Or combine both (development only — not recommended for production):
    celery -A tasks.celery_app worker --beat --loglevel=info
"""

import os
from celery import Celery
from celery.schedules import crontab

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "wisehaven",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["tasks.maturity_monitor"],
)

celery_app.conf.update(
    # Serialisation
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    # Timezone — match the application's UTC stance
    timezone="UTC",
    enable_utc=True,
    # Retry behaviour
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_default_retry_delay=60,      # seconds
    task_max_retries=3,
    # Result expiry — we don't consume results so keep them briefly
    result_expires=3600,
    # Beat schedule — periodic tasks
    beat_schedule={
        "check-matured-locks-every-5-minutes": {
            "task": "tasks.maturity_monitor.check_matured_locks",
            "schedule": crontab(minute="*/5"),   # every 5 minutes
            "options": {"expires": 270},         # drop if not consumed within 4.5 min
        },
    },
)
