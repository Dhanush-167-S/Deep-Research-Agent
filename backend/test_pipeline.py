import asyncio
from app.agents.graph import orchestrator
from app.agents.state import AgentState

async def test_full_pipeline():
    state = AgentState(
        session_id="test_ses_999",
        query="Compare Kafka vs RabbitMQ for high-throughput distributed notification systems with benchmarks."
    )
    print("=== Starting Full Multi-Agent Pipeline Test ===")
    async for event in orchestrator.run_with_events(state):
        print(f"[SSE Event] {event.get('event')} | Agent: {event.get('agent', 'N/A')}")
        if event.get('event') == 'research_completed':
            print("=== RESEARCH COMPLETED SUCCESSFULLY ===")
            report_text = event.get('report', '')
            print(f"Report Length: {len(report_text)} chars")
            print(f"Confidence Score: {event.get('confidence')}%")

            # Test PDF exporter
            from app.services.exporter import exporter
            pdf_bytes = exporter.generate_pdf_bytes(
                title=state.query,
                markdown_content=report_text,
                metadata={"confidence_score": event.get('confidence'), "sources_count": len(event.get('verified_sources', []))}
            )
            print(f"PDF Generated Successfully: {len(pdf_bytes)} bytes!")

if __name__ == "__main__":
    asyncio.run(test_full_pipeline())

