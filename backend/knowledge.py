from pathlib import Path

knowledge = ""


def load_knowledge():

    global knowledge

    if knowledge:
        return knowledge

    path = Path("knowledge.txt")

    with open(path, "r", encoding="utf-8") as file:

        knowledge = file.read()

    return knowledge
