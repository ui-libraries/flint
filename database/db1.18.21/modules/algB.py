import sys
sys.path.insert(0, '//notebooks/Hannah notebooks/header metadata/modules')
from modules import basiq
import re
import os
import json
from itertools import repeat
import statistics
import random
import csv

fileDir = os.path.dirname(os.path.realpath('__file__'))
filename = os.path.join(fileDir, 'txtfiles/cleanlist.txt')
f = open(filename, "r+")
cleanlist0 = f.read()
cleanlist = re.split('\n',cleanlist0)

fileDir = os.path.dirname(os.path.realpath('__file__'))
filename = os.path.join(fileDir, 'txtfiles/typolist.txt')
f = open(filename, "r+")
typolist0 = f.read()
typolist = re.split('\n',typolist0)


def getBcanons(op5,ot2,sfun,deptlist):
    nopgs,Bdups,Bnodups,ts_Bdups,ts_Bnodups,Bd_depts=getDupSets(ot2)
    scores1,scores3,scores4=algor_score(Bd_depts,op5,deptlist,typolist,cleanlist,sfun)

    goodpg=[]
    badpg=[]
    phpg=[]
    # get lists of canon, noncanon, and ph pages #
    for setd in scores4: #scores4=list of dup sets, where e/ set has canon dup marked as such
        for fn_sc in setd:
            pg = fn_sc[0]
            code = fn_sc[1]
            if code == 1:
                goodpg.append(pg)
            elif code == 0:
                badpg.append(pg)

    print("total dups: " + str(len(goodpg)+len(badpg)))

    
    # STEP 4: code the diff types of emails
    # # # 0 = is a dup/DON'T USE; 1 = is a dup/USE; 2 = not a dup/USE, 3 = totssndr/USE
    db = []
    err = []
    print("labeling emails")
    for item in op5:
        e = item[1]
        t_s = (e[0],e[1])
        pg = item[0]
        if t_s in ts_Bdups: # if item has a duplicate
            if pg in goodpg: # and is good
                B = 1
                new = (item,B)
            elif pg in badpg: # and is trash
                B = 0
                new = (item,B)
        elif t_s in ts_Bnodups: # if item is not a duplicate
            B = 2
            new = (item,B)
        elif pg in nopgs:
            B = 3
            new = (item,B)
        else:
            err.append(item)
            print("ERROR")
        db.append(new)

    # STEP 4.5: check ya work
    use = []
    dntuse = []
    useD = []
    useND = []
    useNO=[]
    for a in db:
        if a[1] == 1: #yesdups
            use.append(a)
            useD.append(a)
        if a[1] == 2: #nodups
            use.append(a)
            useND.append(a)
        elif a[1] == 0: #yesdups
            dntuse.append(a)
        elif a[1] == 3: #no
            use.append(a)
            useNO.append(a)
    print("canonical dups: "+str(len(useD)))
    print("canonical nondups: "+str(len(useND)))
    print("noncanonical dups: "+str(len(dntuse)))
    print("noinfos: "+str(len(useNO)))

    if len(Bdups) - len(useD) - len(dntuse) <5 :
        pass
    else:
        print("ERROR1")
        print(len(Bdups) - len(use))
    if len(Bnodups) - len(useND) == 0:
        pass
    else:
        print("ERROR2")
        print(len(Bnodups) - len(useND))
    if len(use)+len(dntuse) == len(op5):
        pass
    else:
        print("ERROR3")
    if len(nopgs)-len(useNO)<5:
        pass
    else:
        print("ERROR4")

    # STEP 5
    db2=[]
    for itemd in db:
        pgded = itemd[0]
        pgd = pgded[0]
        ed = pgded[1]
        coded = itemd[1]
        for itema in op5:
            pga=itema[0]
            ea = itema[1]
            if pga==pgd:
                new = (pga,ea,coded)
                db2.append(new)
    print(len(db)-len(db2)) # i think it's ok that these aren't in, just a matter of a excl more than d

    listB=[]
    printB=[]
    for item in db2:
        code = item[2]
        e = item[1]
        pgid = item[0]
        new = (pgid,code)
        newx = (pgid,str(code))
        listB.append(newx)
    #return db
    return scores1, listB




# secondary functions

def getDupSets(ot2):
    # STEP 1: exclude any with NOTIMESTAMP or NOSENDER
    ot2_1=[]
    no=[]
    for item in ot2:
        em = item[0]
        if em[0] != 'NOTIMESTAMP' and em[1] != 'X':
            ot2_1.append(item)
        else:
            no.append(item)
    nopgs=[]
    for item in no:
        pg=item[1]
        nopgs.extend(pg)

    # STEP 2: divide into those with dups (Bdups) and those w/o (Bnodups)
    Bdups = []
    Bnodups = []
    for xs in ot2_1:
        if len(xs[1]) > 1:
            Bdups.append(xs) #is a B dup
        elif len(xs[1]) ==1:
            Bnodups.append(xs) #has no dups
    # Bdups = emails that have dups; Bnodups = emails with no dups


    # list of just timestamps that have/don't have dups
    ts_Bdups=[]
    for xs in Bdups:
          ts_Bdups.append(xs[0])
    ts_Bnodups=[]
    for xs in Bnodups:
          ts_Bnodups.append(xs[0])


    Bd_depts = []
    for e in Bdups:
        deplist = e[1]
        Bd_depts.append(deplist) # list of dup sets, pgs

    if (len(Bdups)+len(Bnodups)) / len(ot2_1) == 1:
        pass
        print("perc w/ dups: " + str(len(Bdups)/len(ot2_1))) # % that have duplicates (more than one deptfile)
    else:
        print("ERROR")
    return nopgs,Bdups,Bnodups,ts_Bdups,ts_Bnodups,Bd_depts









def algor_score(Ad_depts,op5,deptlist,typolist,cleanlist,sfun):
    scores1=[]
    for pglist in Ad_depts:
        #try:
        # getting scores
        out=[]
        outsetINFO=alg_info(pglist,op5)
        outsetDEQ=alg_DEQ(pglist)
        outsetBM=alg_bm(pglist,deptlist)
        outsetTYPO,outsetRIGHT=alg_tyri(pglist,op5,typolist,cleanlist)
        #outsetCHAR=alg_char(pglist,esplit)
        #outsetEDIT=alg_edit(pglist,yfp5,sfun)
        #except:
        #    print("ERR: " + str(pglist))
        #    continue

        #outx=[]
        out.extend(outsetINFO)
        if outsetDEQ!=[]:
            out.extend(outsetDEQ)
        out.extend(outsetBM)
        out.extend(outsetTYPO)
        out.extend(outsetRIGHT)
        #out.extend(outsetCHAR)
        #out.extend(outsetEDIT)

        out0=list(dict.fromkeys(out))
        out0.sort()
        scores1.append(out0)#scores and details of what went into score
        ps = str(len(scores1)) + "/" + str(len(Ad_depts))
        print(ps,end="\r")

    scores1.sort()
    #combining scores of each pg
    scores3=[]
    for pglistf in scores1:
        ndl = {}
        for pgs in pglistf:
            newdic = {}
            score = pgs[1]
            pg = pgs[0]
            if pg not in [*ndl]:
                newdic[(pg)] = [score]
                ndl.update(newdic)
            else:
                ndl[(pg)].append(score)
                pass
        scores2 = tolist(ndl) #scores combined for each pg -- (pg, [0,2,3])
        news=[]
        #sum scores of each pg
        for pgs in scores2:
            scorelist = pgs[1]
            pg = pgs[0]
            finscore= sum(scorelist)
            new = (pg,finscore)
            news.append(new)
        news.sort()
        scores3.append(news)
    #taking best score of each pglist
    scores4 =[]
    for pglist in scores3:
        pglist.sort(key=takeSecond)
        pglist2 = revlist(pglist)
        best = pglist2[0]
        outb=[]
        for pg in pglist2:
            score = pg[1]
            deptf = pg[0]
            if pg[0] == best[0]:
                canon = (pg[0],1)
                outb.append(canon)
                outb.sort()
            elif pg[0] != best[0]:
                uncanon = (pg[0],0)
                outb.append(uncanon)
                outb.sort()
        scores4.append(outb) #best score highlighted via binary
    return scores1,scores3,scores4

def alg_tyri(pglist,op5,typolist,cleanlist): #prefers hme w/ typo-words not in subj, w/ names in cleanlist
    outsetTYPO=[]
    outsetRIGHT=[]
    rights=[]
    typos=[]
    fin=[]
    for pgs in pglist:
        typo=[]
        right=[]
        nums = []
        for b in op5:
            deptf=b[0]
            e = b[1]
            if deptf == pgs:
                ts = e[0]
                sndr = e[1]
                tol = e[2]
                ccl = e[3]
                subj = e[4]
                if sndr in typolist:
                    new=("sndr",sndr)
                    typo.append(new)
                elif sndr in cleanlist:
                    right.append(sndr)
                for to in tol:
                    if to in typolist:
                        new=("to",to)
                        typo.append(new)
                    elif to in cleanlist:
                        right.append(to)
                for cc in ccl:
                    if cc in typolist:
                        new=("Cc",cc)
                        typo.append(new)
                    elif cc in cleanlist:
                        right.append(cc)
                for ty in typolist:
                    t = re.findall(ty,subj)
                    if t!=[] and len(t[0])>4:
                        newp = (t,subj)
                        typo.append(newp)
                    elif t==[]:
                        pass
        newri=(pgs,len(right),right)
        rights.append(newri)
        rights.sort(key=takeSecond)
        bestr=rights[-1]
        maxri = bestr[1]
        rights2=[]
        for item in rights:
            if maxri >0:
                riscore = item[1]
                Zriscore = (item[1]/maxri)
                newri2 = (item[0],Zriscore,str("right: "+ str(item[2])))
                rights2.append(newri2)
            elif maxri==0:
                newri2 = (item[0],0,str("no rights in any"))
                rights2.append(newri2)
                pass
        outsetRIGHT.extend(rights2)
        #typos
        newty=(pgs,len(typo),typo)
        typos.append(newty)
        typos.sort(key=takeSecond)
        bestt=typos[0]
        maxty=bestt[1]
        typos2=[]
        for item in typos:
            if maxty>0:
                tyscore=item[1]
                #Ztyscore=(item[1]/maxty)
                newty2=(item[0],-tyscore,str("typos: " + str(item[2])))
                typos2.append(newty2)
            elif maxty==0:
                newty2=(item[0],0,"no typos")
                typos2.append(newty2)
        outsetTYPO.extend(typos2)
    return outsetTYPO,outsetRIGHT


def alg_bm(pglist,deptlist): #prefers pgs in shorter bms
    outsetBM = []
    goodnum=[]
    newsBM=[]
    refs=[]
    ress=[]
    for dept in deptlist:#["msp","deq","dhhs","executiveofficeemails"]:
        bn1 = "[0-9]*_b[0-9]+_[0-9]+_([0-9]+)_.*txt"
        bn2 = "[0-9]*_b[0-9]+_([0-9]+)_[0-9]+_.*txt"
        ref = str(dept + bn1 + "|")
        refs.extend(ref)
        res = str(dept + bn2 + "|")
        ress.extend(res)
    ress.pop()
    refs.pop()
    resss = ''.join(ress)
    refss = ''.join(refs)
    for pgs in pglist:
        first = re.findall(refss,pgs)
        sec = re.findall(resss,pgs)
        fs=[]
        ss=[]
        for f in first[0]:
            if f!='':
                fs.append(f)
        for s in sec[0]:
            if s!='':
                ss.append(s)
        if fs != [] and ss != []:
            bmsize = int(fs[0])-int(ss[0])
            newBM = (pgs,bmsize)
            newsBM.append(newBM)
        goodnum.append(newBM[1])
    minnum = min(goodnum)
    for newBM in newsBM:
        if newBM[1] == minnum:
            xcanon = (newBM[0],1,"bm") # how many points is BM worth?
            outsetBM.append(xcanon)
        else:
            uncanon = (newBM[0],0,"bm")
            outsetBM.append(uncanon)
    return outsetBM


def alg_DEQ(pglist): #deq rankings (update this...)
    def sortdeq(elem):
        preflist = (14, 15, 16, 17, 18, 19, 20, 21, 24, 25, 26, 27, 28, 13, 12, 11, 10, 9, 4, 3, 2, 1)
        for n in preflist:
            if elem == n:
                rank = preflist.index(n)
                return rank
    deqs=[]
    for pgs in pglist:
        deptdeq=re.findall("deq",pgs)
        if deptdeq!=[]:
            deqs.append(pgs[0])
    if len(deqs)==len(pglist):
        outsetDEQ = []
        deqnums = []
        for pgs in pglist:
            deqnum = re.findall("deq(..).*txt",pgs)
            deqnums.append(int(deqnum[0]))
        deqnums.sort(key=sortdeq)
        nu = deqnums[0]
        pgstr = '\n'.join(pglist)
        r = re.findall("deq0*" + str(nu) + ".*txt",pgstr)
        if r!=[]:
            for rs in r:
                canon = (rs,1,"deq") # how many points is DEQ worth?
                outsetDEQ.append(canon)
            for x in range(0,len(pglist)):
                if pglist[x] not in r:
                    noncanon = (pglist[x],0,"deq")
                    outsetDEQ.append(noncanon)
    else:
        outsetDEQ=[]
    return outsetDEQ



def alg_info(pglist,op5): #prefers items w/ least num of empty/placeholder fields
    # INFO #
    outsetINFO=[]
    outINFO=[]
    newsI=[]
    for pgs in pglist:
        info=[]
        nums = []
        for b in op5: ######
            deptf=b[0]
            e = b[1]
            if deptf == pgs:
                ts = e[0]
                sndr = e[1]
                to = e[2]
                cc = e[3]
                subj = e[4]
                if ts != 'NOTIMESTAMP':
                    info.append(ts)
                if sndr != 'X':
                    info.append(sndr)
                if to!=('X',)and to!=():
                    info.append(to)
                if cc!= ("NOCc",) and cc!=('X',) and cc!=():
                    info.append(cc)
                if len(subj)>2:
                    info.append(subj)
        goodnum = len(info)
        newI = (pgs,goodnum)
        newsI.append(newI)
        nums.append(newI[1])
    maxnum = max(nums)
    for newI in newsI:
        if newI[1] == maxnum:
            xcanon = (newI[0],2,"info") # how many points is INFO worth?
            outsetINFO.append(xcanon)
        else:
            uncanon = (newI[0],0,"info")
            outsetINFO.append(uncanon)
    return outsetINFO


def splitemails(emailstext):
    esplit = re.split('---endPAGE',emailstext)
    esplit2=[]
    for es in esplit:
        regl=[]
        regex="[a-z]+[0-9]+.*txt$"
        fn = re.findall(regex,es)
        if fn ==[] or len(fn)>1:
            print(es)
        else:
            new = (fn[0],es)
            esplit2.append(new)
    return esplit,esplit2



import re
def revlist(deqlist):
    newlist = list(reversed(deqlist))
    return newlist
def takeFirst(elem):
    return elem[0]
def takeSecond(elem):
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

    
    

