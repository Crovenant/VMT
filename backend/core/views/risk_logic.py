from collections import OrderedDict

def assign_ids_and_merge(existing_data, unique_new_entries):
    last_id = max((item.get("id", 0) for item in existing_data), default=0)
    for i, entry in enumerate(unique_new_entries, start=1):
        entry_ordered = OrderedDict()
        entry_ordered["id"] = last_id + i
        for key in entry:
            if key != "id":
                entry_ordered[key] = entry[key]
        existing_data.append(entry_ordered)
    return existing_data


def update_selected_entries(existing_data, selected_entries, lookup):
    updated_data = []
    used_keys = set()

    for entry in selected_entries:
        key = (entry.get("idExterno"), entry.get("numero"))
        entry_ordered = OrderedDict()
        entry_ordered["id"] = lookup.get(key, {}).get("id", None) or (
            max((item.get("id", 0) for item in existing_data), default=0) + 1
        )
        for k in entry:
            if k != "id":
                entry_ordered[k] = entry[k]
        used_keys.add(key)
        updated_data.append(entry_ordered)

    final_data = [
        item for item in existing_data
        if (item.get("idExterno"), item.get("numero")) not in used_keys
    ] + updated_data

    return final_data