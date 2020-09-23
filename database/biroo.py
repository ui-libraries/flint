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
import statistics
import random
from itertools import repeat

    
def getFP5(emailstext,listpgs,dept):
    import time
    start_time = time.time()
    print(dept)
    regex0 = str(dept + "[0-9_b.]+txt---endPAGE")
    deptpgs = re.findall(regex0,emailstext)
    deptpgsx=[]
    for d in deptpgs:
        ddept = re.findall(dept,d)
        if ddept!=[]:
            deptpgsx.append(ddept[0])
    cleanlist = getcleanlist('txtfiles/cleanlist.txt') #'clean' list of names
    
    FP5 = machineall(listpgs,deptpgsx,cleanlist,dept)
    
    print(str(len(FP5)) +" pages with emailmetadata out of " + str(len(deptpgs)) + " pgs in dept")
    print("dept time: " + "%s seconds" % (time.time() - start_time))
    return FP5

def getDB(FP5,k,ID):
    
    FP50, dalluts = mismatches(FP5)
    print("            processing",end="\r")
    OP5 = process(FP50,k,ID)
    
    OP50 = exclude(OP5,dalluts,k)
    print("            combining    ",end="\r")
    OT5 = combine(OP50)
    OT5.sort(key=takeFofF)
    print(str(len(OP50)) + " total emails returned")
    print(str(len(OT5)) + " unique emails returned")
    return FP50, OP50, OT5









# functions

def getcleanlist(pathtotxt):
        import os
        import re
        import sys
        fileDir = os.path.dirname(os.path.realpath('__file__'))
        filename = os.path.join(fileDir, pathtotxt)
        f = open(filename, "r+")
        cleanlist0 = f.read()
        cleanlist = re.split('\n',cleanlist0)
        return cleanlist

def machineall(listpgs,deptpgsx,cleanlist,dept): #chagne this
        Sdepts = []
        Sdepts = []
        #regex = getreg(["msp","deq","dhhs","executiveofficeemails"])
        regex = str(dept + ".*txt")
        #listpgs = re.split("---endPAGE",bmpgl_emailstext)
        allx=[]
        for pg in listpgs:
            listTS = uts.getUnixTS(pg) #1*
            listTSr = uts.getUnixTSr(pg) #1*
            listSo = srec.findRawSenders(pg,cleanlist) #2*
            listto = srec.findTo(pg,cleanlist)
            listCc = srec.findCc(pg,cleanlist)#3
            listSub = hme.findSubj_mac(pg) #4*
            #regex = str('.*txt') # e.g. "dept.*txt"
            deptfile = re.findall(regex,pg) #0
            if deptfile == [] or listTS == [] or listSo == []:
                allx.append(deptfile)
                pass
            else:
                Sdept = (deptfile[0],tuple(listTSr),tuple(listSo),listto,listCc,tuple(listSub))
                Sdepts.append(Sdept)
                allx.append(deptfile)
                sdl = (str(len(allx)))+"/"+(str(len(listpgs)))
                pdl = "   " + str(round(len(allx)/len(listpgs)*100,2)) + '%'                           
                print(sdl+pdl,end="\r")
                #print(pdl,end="\r")
        return Sdepts


def mismatches(deptpg):
    deptslist = []
    misfits=[]
    for depts in deptpg:
        if len(depts[1]) == len(depts[2]) == len(depts[3]) == len(depts[4]) == len(depts[5]):
            deptslist.append(depts)
        else:
            misfits.append(depts)
    if len(deptpg)!=0:
        print("% with all matched fields: " + str(len(deptslist)/len(deptpg))) # % good
    # what is in that other 11%?
    alluts=[]
    otheruts=[]
    missing=[]
    missingts=[]
    misuts=[]
    for series in deptslist:
        utslist = series[1]
        for ut in utslist:
            alluts.append(ut)
    dalluts=list(dict.fromkeys(alluts)) #all uts in good

    for series in misfits:
        utslist = series[1]
        for ut in utslist:
            misuts.append(ut)

    for ut in misuts:
        if ut not in dalluts:
            missing.append(ut)

    fixed = []
    for m in misfits: #missing or misfits, dep if you want to include already-accted-for dups in misfits
        lenuts = len(m[1])
        lensen = len(m[2])
        lento = len(m[3])
        lencc = len(m[4])
        lensub = len(m[5])
        if lensen != lenuts:
            sen = []
            for i in repeat(None, lenuts):
                sen.append("X")
        else:
            sen = m[2]
        if lento != lenuts:
            tos = []
            for i in repeat(None, lenuts):
                tos.append("X")
        else:
            tos = m[3]
        if lencc != lenuts:
            ccs = []
            for i in repeat(None, lenuts):
                ccs.append("X")
        else:
            ccs = m[4]
        if lensub != lenuts:
            subs = []
            for i in repeat(None, lenuts):
                subs.append("X")
        else:
            subs = m[5]
        new = (m[0],m[1],sen,tos,ccs,subs)
        fixed.append(new)
    deptpg2 = list(deptslist + fixed)
    #CHECK
    deptslist2 = []
    misfits2=[]
    for depts in deptpg2:
        if len(depts[1]) == len(depts[2]) == len(depts[3]) == len(depts[4]) == len(depts[5]):
            deptslist2.append(depts)
        else:
            misfits2.append(depts)
    if len(deptpg2)!=0:
        print("after clearing bad fields of mismatched pages, " + str((len(deptslist2)/len(deptpg2))*100) + "% of pages have all matched fields") # % good
    return deptpg2, dalluts
    
    
    

# KEY: a - all; b - nosub; c - nosub, noCCs; d - nosub, noCCs, noTos
def process(deptslist,k,ID):
    newlist1 = []
    for md in deptslist:
        tss = md[1]
        sndrs = md[2]
        tos = md[3]
        Ccs = md[4]
        subs = md[5]
        o = len(tss)
        p = len(sndrs)
        if ID == "id":
            for x in range(o):
                fileid = str(str(md[0]) + "--" + str(x+1) + "/" + str(o))
                g = (fileid,(tss[x]),(sndrs[x]),tuple(tos[x]),tuple(Ccs[x]),(subs[x]))
                newlist1.append(g)
        elif ID == "noid":
            for x in range(o):
                g = (md[0],(tss[x]),(sndrs[x]),tuple(tos[x]),tuple(Ccs[x]),(subs[x]))
                newlist1.append(g)

    newlist2 = []
    for news in newlist1:
        deptf = news[0]
        if k=="5":
            r = (deptf,(news[1],news[2],news[3],news[4],news[5]))
        elif k=="4":
            r = (deptf,(news[1],news[2],news[3],news[4]))#,news[5]))
        elif k=="3":
            r = (deptf,(news[1],news[2],news[3]))#,news[4],news[5]))
        elif k=="2":
            r = (deptf,(news[1],news[2]))#,news[3],news[4],news[5]))
        else:
            print("invalid")
        newlist2.append(r)
        print(len(newlist2),end="\r")
    return newlist2

def exclude(newlist,dalluts,k):
    dn = []
    newlist2 = []
    for series in newlist:
            e = series[1]
            if k == "5":
                if e[1] == 'X' or e[2] == ('X',) or e[3] == ('X',) or e[4] == 'X':
                    if e[0] in dalluts:
                        dn.append(series)
                    else:
                        newlist2.append(series)
                else:
                    newlist2.append(series)
            elif k == "2":
                if e[1] == 'X':
                    if e[0] in dalluts:
                        dn.append(series)
                    else:
                        newlist2.append(series)
                else:
                    newlist2.append(series)
    if len(newlist)!=0:
        print(str(len(dn)) + " emails with cleared fields (" + str((len(dn)/len(newlist))*100) + "%) excluded because they probably have viable duplicates")
    return newlist2




def combine(list0):
    ndl = {}
    nts = []
    for tups in list0:
        deptf = tups[0]
        metadata = tups[1]
        ut = metadata[0]
        if ut != "NOTIMESTAMP":
            deptflist = [deptf]
            newdic = {}
            if metadata not in [*ndl]:
                newdic[(metadata)] = deptflist
                ndl.update(newdic)
                print(len(ndl),end="\r")
            else:
                ndl[(metadata)].append(deptf)
                pass
                print(len(ndl),end="\r")
        elif ut == "NOTIMESTAMP":
            tups1 = ((metadata),[deptf])
            nts.append(tups1)
            #print(len(nts),end="\r")
    lndl = tolist(ndl)
    lndl.extend(nts)
    return lndl








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
def takeNum(elem,x):
    return elem[x]
def takeSec(elem):
    return elem[1]
def takeNumifint(elem,x):
    if type(elem[x]) == int:
        return int(elem[x])
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
def getreg(listofdepts):
    refs=[]
    for dept in listofdepts:
        bn1 = "[0-9]*_b[0-9]+_[0-9]+_[0-9]+_.*txt"
        ref = str(dept + bn1 + "|")
        refs.extend(ref)
    refs.pop()
    refss = ''.join(refs)
    return refss
    
    
