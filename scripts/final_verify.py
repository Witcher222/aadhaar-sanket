import requests

response = requests.get('http://localhost:8000/api/overview/')
api_data = response.json().get('data', {})

stats = {
    "districts_analyzed": api_data.get('national_stats', {}).get('total_regions', 0),
    "migration_velocity": api_data.get('national_stats', {}).get('migration_velocity', 'N/A'),
    "alerts_count": len(api_data.get('alerts', []))
}

print(f"Stats Mapping Check:")
print(f"  Districts Analyzed: {stats['districts_analyzed']}")
print(f"  Migration Velocity: {stats['migration_velocity']}")
print(f"  Alerts Count: {stats['alerts_count']}")

if stats['districts_analyzed'] > 0 and stats['alerts_count'] > 0:
    print("\nSUCCESS: Data mapping is correct and results are positive.")
else:
    print("\nFAILURE: One or more critical metrics mapped to zero.")
