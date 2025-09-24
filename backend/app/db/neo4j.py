"""
Neo4j database connection and session management
"""

from neo4j import GraphDatabase
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class Neo4jDriver:
    def __init__(self):
        self.driver = None
        self.connect()

    def connect(self):
        """Connect to Neo4j database"""
        try:
            # Skip Neo4j if credentials not provided (for Railway deployment)
            if not settings.NEO4J_URL or settings.NEO4J_URL == "neo4j://localhost:7687":
                logger.warning("Neo4j connection skipped - no production credentials provided")
                return
                
            self.driver = GraphDatabase.driver(
                settings.NEO4J_URL,
                auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
            )
            # Test connection
            with self.driver.session() as session:
                session.run("RETURN 1")
            logger.info("Connected to Neo4j database")
        except Exception as e:
            logger.warning(f"Neo4j connection failed: {e}. Graph features will be disabled.")
            self.driver = None

    def close(self):
        """Close Neo4j connection"""
        if self.driver:
            self.driver.close()

    def get_session(self):
        """Get Neo4j session"""
        if not self.driver:
            self.connect()
        if not self.driver:
            return None
        return self.driver.session()

# Global Neo4j driver instance
neo4j_driver = Neo4jDriver()

def get_neo4j_session():
    """Dependency to get Neo4j session"""
    return neo4j_driver.get_session()
