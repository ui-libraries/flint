import sys
import re

def read_lines(file):
    f = open(file)
    lines = f.readlines()
    f.close()
    return lines

def save_list(list,n):
    file = "list-" + str(n)
    f = open(file,'w')
    for l in list:
        f.write(l)
    f.close()

listfile=sys.argv[1]
lines = read_lines(listfile)

nlist=0
ntotalpage = 0
list_file = []
for line in lines:
    sl = line.replace('.','_').split('_')
    npages = int(sl[2]) - int(sl[1]) + 1

    if npages > 600:
	save_list([line], nlist)
	nlist = nlist + 1
	continue
	
    list_file.append(line)
    ntotalpage = ntotalpage + npages

 
   
    if ntotalpage > 600:
        save_list(list_file, nlist)
        nlist = nlist + 1
        
        list_file = []
        ntotalpage = 0

if ntotalpage > 0:
    save_list(list_file, nlist)        
