letters = ["c","f","j"]
target = "d"
def milk(letters,target):
    if target not in letters:
        return letters[0]
    else:
        black = letters.index(target)
        if black == len(letters)-1:
            return letters[0]
        else:
            return letters[black+1]



print(milk(letters,target))