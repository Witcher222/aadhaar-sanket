import os

# List of files identified by grep
FILES = [
    "src/pages/TrendAnalysis.tsx",
    "src/pages/SpatialStressMap.tsx",
    "src/pages/Settings.tsx",
    "src/pages/Reports.tsx",
    "src/pages/PolicyDecisions.tsx",
    "src/pages/MigrationPatterns.tsx",
    "src/pages/MapDashboard.tsx",
    "src/pages/Forecasts.tsx",
    "src/pages/DataQuality.tsx",
    "src/pages/DataIngestion.tsx",
    "src/pages/AIChatbot.tsx",
    "src/pages/AIAssistant.tsx"
]

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def refactor(rel_path):
    # Absolute path
    path = os.path.join(PROJECT_ROOT, rel_path)
    print(f"Processing {rel_path}...")
    
    if not os.path.exists(path):
        print(f"  Missing: {path}")
        return

    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # 1. Remove Import
        if "import { DashboardLayout }" in content:
            lines = content.splitlines()
            # Filter out the import line
            new_lines = [l for l in lines if "import { DashboardLayout }" not in l]
            content = "\n".join(new_lines)
            print("  Removed import.")
        
        # 2. Remove Wrapper Tags
        if "<DashboardLayout>" in content:
            content = content.replace("<DashboardLayout>", "<>")
            content = content.replace("</DashboardLayout>", "</>")
            print("  Removed wrapper tags.")
            
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
            print("  Saved.")
        else:
            print("  No wrapper found (skipped save).")

    except Exception as e:
        print(f"  Error: {e}")

if __name__ == "__main__":
    print(f"Project Root: {PROJECT_ROOT}")
    for f in FILES:
        refactor(f)
