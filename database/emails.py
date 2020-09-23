import sys
sys.path.insert(0, '//notebooks/Hannah notebooks/header metadata/modules')
from modules import uts
from modules import hme
from modules import srec
from modules import desc
import re
import os
import json
from itertools import repeat

def fixsort(elem):
    regexpg = str("[A-Za-z]*[0-9]*_b[0-9]+_[0-9]+_[0-9]+_([0-9]+).txt")
    pg = re.findall(regexpg, elem)
    regexroot = str("([A-Za-z]*[0-9]*_b[0-9]+_[0-9]+_[0-9]+_)[0-9]+.txt") 
    root = re.findall(regexroot, elem)
    if len(pg[0]) == 1:
        g = str("0" + str(pg[0]))
        t = str(root[0]) + g + ".txt"
        fin = g
    else:
        fin = pg[0]
    return int(fin)
def getEmailsLB(deqlist): #label by bookmark and page
    import re
    first = []
    notf = []
    for fn in deqlist:
        regex1 = str("[A-Za-z]*[0-9]*_b[0-9]+_[0-9]+_[0-9]+_1.txt") 
        g = re.findall(regex1,fn) #executiveofficeemails19_b129_333_333_1.txt
        if g != []:
            first.append(g[0])
        else:
            notf.append(fn)
    def root_pg(listfn):
        nnotf = []
        for notfs in listfn:
            regex2 = str("[A-Za-z]*[0-9]*_b[0-9]+_[0-9]+_[0-9]+_")
            root = re.findall(regex2,notfs)
            pg = re.findall("_([0-9]+[.]txt)",notfs)
            x = (root[0],pg[0])
            nnotf.append(x)
        return nnotf
    firstrp = root_pg(first)
    notfrp = root_pg(notf)
    notfrp.sort(key=takeFirstABC)
    firstrp.sort(key=takeFirstABC)
    notfrp2 = {}
    notfrp2.clear()
    for zitem in notfrp:
        newdicx = {}
        hx = zitem[1]
        if zitem[0] not in [*notfrp2]:
            newdicx[zitem[0]] = [zitem[1]]
            notfrp2.update(newdicx)
        else:
            notfrp2[zitem[0]].append(zitem[1])
    for xitem in firstrp:
        newdicrp = {}
        hx = xitem[1]
        if xitem[0] not in [*notfrp2]:
            newdicrp[xitem[0]] = [xitem[1]]
            notfrp2.update(newdicrp)
        else:
            notfrp2[xitem[0]].append(xitem[1])      
    newgxo = []
    newgxo.clear()
    chapters = []
    chapters.clear()
    for key, value in notfrp2.items():
        gxo = (key, value)
        newgxo.append(gxo)
    newgxo.sort()
    for items in newgxo:
        newlist = []
        for pgs in items[1]:
            o = (str(items[0]) + pgs)
            newlist.append(o)
        newlist.sort(key=fixsort)
        newlistr = list(reversed(newlist))
        chapters.append(newlistr)

    def getEmailsBML(deqlol):
        from urllib import request
        emailstext = ''
        s3_root = "http://d1us66xhqwx73c.cloudfront.net/"
        for family in deqlol:
            familytext = ""
            for deq in family:
                url = s3_root + deq
                response = request.urlopen(url)
                raw_text = response.read().decode('utf8')
                pgd = str(str(deq) + "---endPAGE")
                familytext = pgd.join((raw_text,familytext))
            bmd = "---BOOKMARKend---"
            emailstext = bmd.join((familytext,emailstext))
            print(len(emailstext),end="\r")
        return emailstext

    emailstext = ''.join(getEmailsBML(chapters))
    return emailstext





def getEmails(txtfile,dept,rang):
    import re
    from urllib import request
    f = open(txtfile, "r+")
    deptstr = f.read()
    deptregex = str(dept + ".*txt") # e.g. "executiveofficeemails.*"
    deptlist = re.findall(deptregex, deptstr)
    deptlistr = revlist(deptlist[0:rang])
    dept_emailstext = ''.join(getEmailsLB(deptlistr))
    return dept_emailstext

def splitemails(emailstext,dept):
    esplit = re.split('endPAGE',emailstext)
    esplit2=[]
    for es in esplit:
        regex = str(dept + "[0-9]*_b[0-9]+_[0-9]+_[0-9]+_[0-9]+.txt")
        fn = re.findall(regex,es)
        try:
            new = (fn[0],es)
        except:
            pass
        esplit2.append(new)
    if len(esplit)==len(esplit2):
        pass
    else:
        print("ERROR")
    return esplit2




import re
def revlist(deqlist):
    newlist = list(reversed(deqlist))
    return newlist
def takeFirst(elem):
    return elem[0]
def takeSec(elem):
    return elem[1]
def takeThird(elem):
    return elem[2]
def takeFirstABC(elem):
    if type(elem[0]) == int:
        return int(elem[0])
    else:
        return int(0)
def takeSecondABC(elem):
    if type(elem[1]) == int:
        return int(elem[1])
    else:
        return int(0)
def takeFofF(elem):
    for elems in elem:
        if type(elems[0]) == int:
            return elems[0]
        else:
            return int(0)
    return int(g[0])
def takeFirst1(elem):
    if type(elem[0]) == int:
        return int(elem[0])
    else:
        return int(0)
def tolist(r):
        listr = []
        for key, value in r.items():
            k = (key,value)
            listr.append(k)
        return listr

