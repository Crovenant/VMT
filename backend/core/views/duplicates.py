def detect_duplicates(existing_data, new_entries):
    duplicates = []
    unique_new_entries = []

    existing_by_id = {item.get("idExterno"): item for item in existing_data if item.get("idExterno")}
    existing_by_num = {item.get("numero"): item for item in existing_data if item.get("numero")}

    for entry in new_entries:
        id_key = entry.get("idExterno")
        num_key = entry.get("numero")

        if id_key in existing_by_id:
            duplicates.append({"existing": existing_by_id[id_key], "incoming": entry})
        elif num_key in existing_by_num:
            duplicates.append({"existing": existing_by_num[num_key], "incoming": entry})
        else:
            unique_new_entries.append(entry)

    return duplicates, unique_new_entries


def build_lookup(existing_data):
    return {
        (item.get("idExterno"), item.get("numero")): item
        for item in existing_data
    }