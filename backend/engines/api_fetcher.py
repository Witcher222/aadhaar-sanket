"""
UIDAI Data.gov.in API Fetcher Engine

Fetches real-time Aadhaar enrolment data from the official Open Government Data portal.
"""
import requests
import polars as pl
from pathlib import Path
from datetime import datetime
from io import StringIO
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))

from config import PATHS, UIDAI_API_KEY

# API Configuration
UIDAI_API_CONFIG = {
    "base_url": "https://api.data.gov.in/resource/ecd49b12-3084-4521-8f7e-ca8bf72069ba",
    "api_key": UIDAI_API_KEY,
    "format": "csv",
    "default_limit": 10000,  # Max records per request
}


class UIDAIDataFetcher:
    """
    Fetches Aadhaar enrolment data from the data.gov.in API.
    """
    
    def __init__(self):
        self.base_url = UIDAI_API_CONFIG["base_url"]
        self.api_key = UIDAI_API_CONFIG["api_key"]
        self.output_dir = PATHS["uploads_dir"] / "api_fetch"
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def fetch_data(self, limit: int = None, offset: int = 0) -> dict:
        """
        Fetch data from the UIDAI API.
        
        Args:
            limit: Maximum number of records to fetch (default: 10000)
            offset: Starting record offset for pagination
            
        Returns:
            dict with status, message, file_path (if successful), and record_count
        """
        limit = limit or UIDAI_API_CONFIG["default_limit"]
        
        params = {
            "api-key": self.api_key,
            "format": UIDAI_API_CONFIG["format"],
            "limit": limit,
            "offset": offset,
        }
        
        try:
            print(f"Fetching UIDAI data: limit={limit}, offset={offset}...")
            response = requests.get(self.base_url, params=params, timeout=60)
            
            if response.status_code == 429:
                return {
                    "success": False,
                    "error": "API rate limit exceeded. Please try again in a few minutes.",
                    "status_code": 429,
                }
            
            response.raise_for_status()
            
            # Parse CSV response
            csv_content = response.text
            if not csv_content.strip():
                return {
                    "success": False,
                    "error": "API returned empty data.",
                }
            
            # Convert to DataFrame for validation and save
            df = pl.read_csv(StringIO(csv_content))
            record_count = len(df)
            
            if record_count == 0:
                return {
                    "success": False,
                    "error": "No records found in API response.",
                }
            
            # Generate timestamped filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = self.output_dir / f"uidai_enrolment_{timestamp}.csv"
            
            # Save as CSV
            df.write_csv(output_file)
            
            print(f"Saved {record_count} records to {output_file}")
            
            return {
                "success": True,
                "message": f"Successfully fetched {record_count} records from UIDAI API.",
                "file_path": str(output_file),
                "record_count": record_count,
                "columns": df.columns,
            }
            
        except requests.exceptions.Timeout:
            return {
                "success": False,
                "error": "Request timed out. The API server may be slow.",
            }
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"API request failed: {str(e)}",
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to process API response: {str(e)}",
            }
    
    def fetch_all_pages(self, max_records: int = 50000) -> dict:
        """
        Fetch multiple pages of data up to max_records.
        
        Args:
            max_records: Maximum total records to fetch across all pages
            
        Returns:
            dict with aggregated results
        """
        all_records = []
        offset = 0
        page_size = UIDAI_API_CONFIG["default_limit"]
        
        while offset < max_records:
            result = self.fetch_data(limit=min(page_size, max_records - offset), offset=offset)
            
            if not result.get("success"):
                if offset == 0:
                    return result  # First page failed, return error
                break  # Partial success, return what we got
            
            all_records.append(result)
            offset += result.get("record_count", 0)
            
            # If we got fewer records than requested, we've reached the end
            if result.get("record_count", 0) < page_size:
                break
        
        total_records = sum(r.get("record_count", 0) for r in all_records)
        
        return {
            "success": True,
            "message": f"Fetched {total_records} total records in {len(all_records)} page(s).",
            "total_records": total_records,
            "pages_fetched": len(all_records),
        }


def get_uidai_fetcher() -> UIDAIDataFetcher:
    """Get singleton instance of the UIDAI data fetcher."""
    return UIDAIDataFetcher()


# For direct testing
if __name__ == "__main__":
    fetcher = get_uidai_fetcher()
    result = fetcher.fetch_data(limit=100)
    print(result)
