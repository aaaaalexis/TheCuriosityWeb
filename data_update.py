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

def create_translations(data, keys=None, prefix=None):
    """
    Create translations using original keys from the data
    
    Args:
        data: Dictionary of language data
        keys: List of specific keys to include, or None for all/prefix-filtered
        prefix: Optional prefix to filter keys
    """
    translations = {}
    
    if prefix:
        # Get all keys that match the prefix from any language file
        all_keys = set()
        for lang_data in data.values():
            all_keys.update(key for key in lang_data if key.startswith(prefix))
        keys = sorted(all_keys)
    elif keys is None:
        # Get all keys from any language file
        all_keys = set()
        for lang_data in data.values():
            all_keys.update(lang_data.keys())
        keys = sorted(all_keys)
    
    for key in keys:
        trans = {lang: data[lang].get(key) for lang in data if data[lang].get(key)}
        if trans:
            translations[key] = OrderedDict(sorted(trans.items()))
    
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
            "gc": create_translations(gc_data, prefix="upgrade_"),
            "main": create_translations(main_data, [
                "CitadelShopSearch",
                "CitadelCategoryWeapon",
                "CitadelCategoryArmor",
                "CitadelCategoryTech",
                "BrowseItems_Title",
                "BrowseItems_Desc",
                "item_info_active",
                "item_info_new"
            ]),
            "attributes": create_translations(attributes_data, [
                "WeaponPower_label",
                "ArmorPower_label",
                "TechPower_label"
            ])
        }

        print("Writing output to JSON file...")
        with open('json/i18n.json', 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=2)

        print("Done! Output saved to i18n.json")

if __name__ == "__main__":
    main()