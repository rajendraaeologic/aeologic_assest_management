#!/bin/bash

# --- Configuration ---
DEFAULT_ENV_FILE=".env"
DEFAULT_JSON_FILE="env.json"

# --- Helper Functions ---
usage() {
  echo "Usage: $0 [INPUT_ENV_FILE] [OUTPUT_JSON_FILE]"
  echo "Converts a .env file to a JSON file suitable for gcloud functions."
  echo ""
  echo "Arguments:"
  echo "  INPUT_ENV_FILE    Path to the input .env file (default: ${DEFAULT_ENV_FILE})"
  echo "  OUTPUT_JSON_FILE  Path for the output JSON file (default: ${DEFAULT_JSON_FILE})"
  echo ""
  echo "Example:"
  echo "  $0 myapp.env myapp_env_vars.json"
  echo "  $0 # Uses .env and outputs to env.json"
  exit 1
}

# --- Main Logic ---

# Check for jq
if ! command -v jq &> /dev/null; then
  echo "Error: jq is not installed. Please install jq to use this script."
  echo "e.g., sudo apt-get install jq  OR  brew install jq"
  exit 1
fi

# Determine input and output files
ENV_FILE="${1:-$DEFAULT_ENV_FILE}"
JSON_FILE="${2:-$DEFAULT_JSON_FILE}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: Input file '$ENV_FILE' not found."
  usage
fi

echo "Converting '$ENV_FILE' to '$JSON_FILE'..."

# Start JSON object
echo "{" > "$JSON_FILE"

first_entry=true

# Read the .env file line by line
# Using `IFS=` and `read -r` to correctly handle leading/trailing whitespace and backslashes
while IFS= read -r line || [[ -n "$line" ]]; do
  # Trim leading and trailing whitespace from the line
  line=$(echo "$line" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')

  # Skip empty lines and comments
  if [[ -z "$line" ]] || [[ "$line" =~ ^# ]]; then
    continue
  fi

  # Split on the first '='
  # Key is everything before the first '='
  key="${line%%=*}"
  # Value is everything after the first '='
  value="${line#*=}"

  # Remove potential surrounding quotes from the value (common in .env files)
  # Handles 'value' and "value"
  if [[ "$value" =~ ^\'[^\']*\'$ ]] || [[ "$value" =~ ^\"[^\"]*\"$ ]]; then
    # Strip first and last character
    value="${value:1:${#value}-2}"
  fi

  # Use jq to safely create JSON strings for key and value
  # -R: raw input, -n: null input, --arg: pass variable
  json_key=$(jq -nR --arg k "$key" '$k')
  json_value=$(jq -nR --arg v "$value" '$v')

  if [ "$first_entry" = true ]; then
    printf "  %s: %s" "$json_key" "$json_value" >> "$JSON_FILE"
    first_entry=false
  else
    printf ",\n  %s: %s" "$json_key" "$json_value" >> "$JSON_FILE"
  fi

done < "$ENV_FILE"

# Close JSON object
if [ "$first_entry" = false ]; then # Only add newline if there were entries
  echo "" >> "$JSON_FILE"
fi
echo "}" >> "$JSON_FILE"

# Validate JSON output (optional but good practice)
if jq empty "$JSON_FILE" &> /dev/null; then
  echo "Successfully converted '$ENV_FILE' to '$JSON_FILE'."
  echo "You can now use it with gcloud:"
  echo "gcloud functions deploy YOUR_FUNCTION_NAME --env-vars-file $JSON_FILE ..."
else
  echo "Error: The generated JSON file '$JSON_FILE' is invalid. Please check the script or input."
  exit 1
fi

exit 0