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

def create_translations(data, keys, flatten=False):
    if flatten:
        return OrderedDict(sorted({lang: data[lang].get(keys) for lang in data if data[lang].get(keys)}.items()))
    
    translations = {}
    for key, value in keys.items():
        trans = {lang: data[lang].get(value) for lang in data if data[lang].get(value)}
        if trans:
            translations[key] = OrderedDict(sorted(trans.items()))
    return translations

def create_ability_translations(data):
    abilities = {}
    english_data = data.get('english', {})
    for key, value in english_data.items():
        if key.startswith('upgrade_'):
            ability_translations = {lang: data[lang].get(key) for lang in data if data[lang].get(key)}
            if ability_translations:
                abilities[value] = OrderedDict(sorted(ability_translations.items()))
    return abilities

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
            "abilities": create_ability_translations(gc_data),
            "ui": {
                "searchPlaceholder": create_translations(main_data, "CitadelShopSearch", flatten=True),
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