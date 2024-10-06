import os
import json
import re
import subprocess
import tempfile
from collections import OrderedDict

def clone_repository(repo_url, target_dir):
    subprocess.run(["git", "clone", "--depth", "1", repo_url, target_dir], check=True)

def process_file(file_path):
    data = {}
    with open(file_path, 'r', encoding='utf-8') as file:
        for line in file:
            line = line.strip()
            if line and not line.startswith('//'):
                match = re.match(r'"([^"]+)"\s+"([^"]+)"', line)
                if match:
                    key, value = match.groups()
                    data[key] = value
    return data

def process_directory(directory):
    data = {}
    for filename in os.listdir(directory):
        if filename.endswith('.txt'):
            file_path = os.path.join(directory, filename)
            lang_code = filename.split('_')[-1].split('.')[0]
            data[lang_code] = process_file(file_path)
    return data

def create_translations(data, keys, prefix=None, flatten=False):
    """
    Generic translation function that can handle both simple and complex translation needs
    
    Args:
        data: Dictionary of language data
        keys: Either a string (single key), dict (mapping of new keys to original keys),
              or None (to get all keys matching prefix)
        prefix: Optional prefix to filter keys (e.g., 'upgrade_')
        flatten: If True, returns translations directly instead of nested under keys
    """
    if isinstance(keys, str):
        # Handle single key case (flatten=True case)
        return OrderedDict(sorted({lang: data[lang].get(keys) for lang in data if data[lang].get(keys)}.items()))
    
    translations = {}
    
    if prefix:
        # Get all keys that match the prefix from any language file
        all_keys = set()
        for lang_data in data.values():
            all_keys.update(key for key in lang_data if key.startswith(prefix))
        
        # Create translations for each key found
        for key in sorted(all_keys):
            trans = {lang: data[lang].get(key) for lang in data if data[lang].get(key)}
            if trans:
                translations[key] = OrderedDict(sorted(trans.items()))
    
    elif keys:
        # Handle dictionary mapping case
        for new_key, original_key in keys.items():
            trans = {lang: data[lang].get(original_key) for lang in data if data[lang].get(original_key)}
            if trans:
                translations[new_key] = OrderedDict(sorted(trans.items()))
    
    return translations

def main():
    repo_url = "https://github.com/SteamDatabase/GameTracking-Deadlock.git"
    
    with tempfile.TemporaryDirectory() as temp_dir:
        print(f"Cloning repository to {temp_dir}...")
        clone_repository(repo_url, temp_dir)
        
        base_path = os.path.join(temp_dir, "game/citadel/resource/localization")
        gc_path = os.path.join(base_path, "citadel_gc")
        main_path = os.path.join(base_path, "citadel_main")
        attributes_path = os.path.join(base_path, "citadel_attributes")

        print("Processing files...")
        gc_data = process_directory(gc_path)
        main_data = process_directory(main_path)
        attributes_data = process_directory(attributes_path)

        output = {
            "gc": create_translations(gc_data, None, prefix="upgrade_"),
            "main": {
                "CitadelShopSearch": create_translations(main_data, "CitadelShopSearch", flatten=True),
                "tabNames": create_translations(main_data, {
                    "weapon": "CitadelCategoryWeapon",
                    "vitality": "CitadelCategoryArmor",
                    "spirit": "CitadelCategoryTech"
                }),
                "tierBonus": create_translations(attributes_data, {
                    "weapon": "WeaponPower_label",
                    "vitality": "ArmorPower_label",
                    "spirit": "TechPower_label"
                }),
                "sidebarInfo": create_translations(main_data, {
                    "title": "BrowseItems_Title",
                    "desc": "BrowseItems_Desc",
                }),
                "labels": create_translations(main_data, {
                    "active": "item_info_active",
                    "new": "item_info_new"
                })
            }
        }

        print("Writing output to JSON file...")
        with open('scripts/data.json', 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=2)

        print("Done! Output saved to data.json")

if __name__ == "__main__":
    main()