# # # this module is for getting header metadata # # #
#primary functions contain secondary functions

# Table of Contents:
# ## primary functions
# ### findSubjects: input text -> output subject lines
# ### findSenders: input text,funcs -> output list of 1. raw senders 2. cleaned senders
# ### findTo: input text, funcs -> output 1. raw recievers 2. cleaned recievers from To:
# ### findCc: input text, funcs -> output 1. raw recievers 2. cleaned recievers from Cc:
# ## secondary functions
# ### editFuncs/edits: input name(s), cleanlist -> output cleaned list
# #### stdize: First Last (Brad Wurfel) -> Last, First (Wurfel, Brad)
# #### likename: difflib changes names close to names in cleanlist.txt
# #### fixname: list of known name errors, reg ex changer


import re
def findSubjects(emailstext):
    import re
    subjects=[]
    subjlist = re.findall("\n\W*Subject[:;\n].*|.*[O0]n.*\n*.*wro.e.", emailstext)
    for things in subjlist:
        ons = re.findall("[O0]n.*\n*.*wro.e[:;\n]", things)
        subjs = re.findall("Subject[:;][\s]*(.*)", things)
        if ons !=[] and subjs==[]:
            subjects.append("NOSub (On)")
        elif subjs != [] and '' not in subjs and ' ' not in subjs:
            subjects.append(subjs[0])
        elif subjs == [] and ons == [] or '' in subjs or ' ' in subjs:
            subjects.append("X")
    return subjects

def findSenders(emailstext, cleanlist,pw=0):
    import re
    roughlist=[]
    roughlist2=[]
    ultimatelist = []
    chngs=[]
    errs=[]
    probnot=[]
    g=[]
    sreg=getSNDRre('','s_starts.txt') # catchall sender reg ex
    senderlist = re.findall(sreg,emailstext) # find things that might be senders
    numhead=len(senderlist)
    for things in senderlist:
        froms = re.findall("\n.{0,10}[\WﬁFEKrIifY¥C][si]*r[eao][enmtyvi]+[-:;'. ](.*)\n", things) #find froms
        ons = re.findall("[O0]n.*\n*.*wro.e[:;\n]", things) #find ons
        W = "[\[\<\(\{].*|\s+\n|[\s\n\W]+$|^[\s\n\W]+|^ |:" # reg ex for noise removal
        if froms!=[]and ons!=[]:
            print(things)
        if froms!=[]:
            fro=froms[0]
            if len(fro)<8: # too short
                roughlist.append("X")
                probnot.append(things)
            else:
                try:
                    frox,chf=takeout(fro,W) # remove probable noise
                    chngs.append(chf) # record any of these removals
                    if frox != '':
                        roughlist.append(frox)
                    else:
                        new=(fro,things,"1")
                        errs.append(new)
                except:
                    new=(fro,things,"2")
                    errs.append(new)
        elif ons!=[]:
            on=ons[0]
            try:
                Wo = W + "|[O0]n[^˚]*[AP]M\W*|[O0]n[^˚]*2[01][0-9][0-9]|[0-9]|wro.e"
                on,cho=takeout(on,Wo)
                chngs.append(cho)
                if on != '':
                    roughlist.append(on)
                else:
                    new=(things,"3")
                    errs.append(new)
            except:
                new=(things,"4")
                errs.append(new)

        elif ons==[] and froms==[] and 5<len(things)<25:# and things!='X':
            roughlist.append(things)
        else:
            new=(things,"5")
            errs.append(new)
            
    roughlist2=editFuncs(roughlist,cleanlist) # run thru edit func to clean it up
    roughlist3=[]
    for m in roughlist2:
        if len(m)<25 or re.findall("@",m)!=[]: #weed out long ones, but keep e-addresses
            roughlist3.append(m)
        else:
            new=(m,"6")
            errs.append(new)
    unaccfor_err=(numhead-len(roughlist3)-len(errs))
    unaccfor=(numhead-len(roughlist3))
    if unaccfor_err != 0: # should return same number originally captured in senderlist
        print(str(unaccfor_err) + " not accounted for")
    else:
        pass
    return roughlist,roughlist3


def findTo(emailstext, cleanlist,pw=0):
    import re
    roughlist2=[]
    roughlist3=[]
    roughlist4 = []
    ultimatelist = []
    chngs=[]
    g=[]
    recvrlist = re.findall("\n.{0,10}T[oa][:;]+.*|.*[O0]n.*wro[ft]e.|[O0]n.*\n*.*wro[tf]e[:;\n]",emailstext) #find headers
    numhead=len(recvrlist)
    for things in recvrlist:
        roughlist = []
        tos = []
        newtos = []
        tos = re.findall("\n\W*T[oa](.*)", things) #find tos
        ons = re.findall("[O0]n[^˚]*wro[tf]e[:;\n]", things) #find ons
        W = "[\[\<\(\{].*|\s+\n|[\s\n\W]+$|^[\s\n\W]+"
        repo=re.findall("Report",things)
        if tos!=[] and repo==[]:
            for to in tos:
                tonames=re.split(";|>,|\),|\",|\',",to)
                for toname in tonames:
                    toname=re.sub(":","",toname)
                    if len(toname)<4:
                        newtos.append("X")
                    else:
                        try:
                            tox,cht=takeout(toname,W)
                            chngs.append(cht)
                            newtos.append(tox)
                        except:
                            newtos.append(toname)
            g.append(newtos)
            if len(tonames)!=len(newtos):
                print("ERR")
            roughlist.extend(newtos)
        elif ons!=[]:
            roughlist.append("NOTo (On)")
            g.append(roughlist)
            pass
        elif ons==[] and tos==[] and len(things)<25 and repo==[]:
            roughlist.append(things)
        roughlist2.append(roughlist)
        
    roughlist3=[]
    for lis in roughlist2:
        rlis=editFuncs(lis,cleanlist) # run thru edit func to clean it up
        roughlist3.append(tuple(rlis))
    
    if len(roughlist2)<len(recvrlist): # 
        if pw==1:
            print(str(recvrlist)+"   "+str(g)+str(roughlist2))#+str(g)+str(chngs))
            pass
    return  roughlist2,roughlist3


def findCc(emailstext, cleanlist,pw=0):
    import re
    roughlist2=[]
    roughlist3=[]
    roughlist4 = []
    ultimatelist = []
    chngs=[]
    g=[]
    recvrlist = re.findall("\n.{0,10}T[oa][:;]+.*\n+.*C[ec]+[:;]+.*\n*.*\n*Subj|\n.*T[oa][:;]+.*\n+.*C[ec]+[:;]+.*\n|\n.{0,10}T[oa][:;]+.*|\n.{0,10}[O0]n.*\n*.*wro.e.",emailstext) #find headers
    numhead=len(recvrlist)
    for things in recvrlist:
        roughlist = []
        ccs = []
        newccs = []
        ccs = re.findall("C[ec]+[:;]+([^˚]+)\n", things) #find ccs
        ons = re.findall("[O0]n[^˚]*wro.e", things) #find ons
        tos = re.findall("\n\W*T[oa](.*)", things) #find tos
        W = "[\[\<\(\{].*|\s+\n|[\s\n\W]+$|^[\s\n\W]+"

        if ccs!=[]:
            for cc in ccs:
                ccnames=re.split(";|>,|\),|\",|\',",cc)
                for ccname in ccnames:
                    ccname=re.sub(":|\n"," ",ccname)
                    if len(ccname)<4:
                        newccs.append("X")
                    else:
                        try:
                            ccx,chc=takeout(ccname,W)
                            chngs.append(chc)
                            newccs.append(ccx)
                        except:
                            newccs.append(ccname)
            if len(ccnames)!=len(newccs):
                print("ERR")
            if newccs != [] and not '' in newccs:
                roughlist.extend(newccs)
                pass
        elif ons!=[]:
            roughlist.append("NOCc (On)")
            pass
        elif ons==[] and ccs==[] and tos !=[]:
            roughlist.append("NOCc")
        roughlist2.append(roughlist)
            
    # edits
    roughlist3=[]
    for lis in roughlist2:
        rlis=editFuncs(lis,cleanlist) # run thru edit func to clean it up
        if rlis!=[]:
            roughlist3.append(tuple(rlis))
        if rlis==[]:
            roughlist3.append(tuple('X'))
    
    if len(roughlist2)<len(recvrlist):
        if pw==1:
            print(str(recvrlist)+"   "+str(roughlist2))#+str(g)+str(chngs))
            pass

    #return roughlist2 # no edits
    return roughlist2,roughlist3


# secondary funcs


def edits(name,cleanlist): # to clean individual name
    name=stdize(name) #first last --> last, first
    ogname=name
    name=fixname(name) #fixes common typos
    name=likename(name,cleanlist) #compares to cleanlist
    if ogname!=name:
        chngstr=ogname+"->"+name
    else:
        chngstr=""
    return chngstr,name


def editFuncs(roughlist,cleanlist): # to clean list
    roughlist2=[]
    for name in roughlist:
        ogname=name
        name=stdize(name)
        name=fixname(name)
        name=likename(name,cleanlist)
        roughlist2.append(name)
    return roughlist2

def fixname(x):
    import re
    def fixingnames(regex,rightname,name):
        new = []
        error_names = re.findall(regex,name)
        if name in error_names:
            return rightname
        elif name not in error_names:
            return name
    f=open("txtfiles/fixnames.txt","r")
    fstr=f.read()
    flist=re.split("\n",fstr)
    fixinput=[]
    for line in flist:
        p=re.split(" ••• ",line) # sequence sep'ing the rightname from wrongname in the textfile
        fixinput.append(p)
    for linef in fixinput:
        rightname=linef[0]
        regexwrongname=linef[1]
        x=fixingnames(regexwrongname,rightname,x)
    return x


def stdize(name):
    import re
    char=re.findall("[A-Za-z]",name)
    if len(name)>3 and char!=[]:
        lastcommafirstdude = re.findall("[A-Za-z][A-Za-z][A-Za-z]+[,.][- ][A-Z][A-Za-z][A-Za-z]+",name)
        firstlast = re.findall("^\W*[A-Z\'a-z]{3}[A-Za-z]* [A-Z\'a-z]{3}[A-Za-z]*|^\W*[A-Z\'a-z]{3}[A-Za-z]* [A-Z][.] [A-Z\'a-z]{3}[A-Za-z]*",name)
        if lastcommafirstdude != []:
            for lcf in lastcommafirstdude:
                lcf1 = re.sub("[.]",",",lcf)
                return lcf1
        
        elif firstlast != []:
            #FIRST NAME
            firstnames = re.findall("^\W*([A-Z\'a-z]{3}[A-Za-z]*) [A-Z]*[.]*[\s]*[A-Z\'a-z]{3}[A-Za-z]*",name)
            if len(firstnames)!=1:
                print("firstnames error1")
                #return name
            f = re.sub("\n|\'|\"","",firstnames[0])
            #LAST NAME
            lastnames = re.findall("^\W*[A-Z\'a-z]{3}[\sA-Za-z.]* ([A-Z\'a-z]{3}[A-Za-z]*)",name)
            if len(lastnames)!=1:
                print("lastnames error1")
                #return name
            l = re.sub("\n|\'|\"","",lastnames[0])
            LFs=[] 
            newLF=str(l)+", "+str(f)
            return newLF

        elif firstlast == [] and lastcommafirstdude == []:
            if name == '\nS' or name == '\nD' or name == '\nT':
                name = re.sub('\n.','NOSENDER',name)
                return name
            else:
                name = re.sub('\n[SDT][^\w]','',name)
                name = re.sub('\n','',name)
                return name
    else:
        return name
    
    


def likename(name,cleanlist):
    g=[]
    import difflib
    correctname = difflib.get_close_matches(name,cleanlist,8,0.9)
    if correctname !=[]:
        return correctname[0]
        pass
    else:
        return name
        pass

def takeout(ogx,regex):
    chngs=[]
    oldx=ogx
    for range in (0,6):
        ogx = re.sub(regex,"",ogx)
        if oldx!=ogx: #if something changed
            ch=("CHANGE"+oldx+"->"+ogx)
            chngs.append(ch)
        else:
            ch='NOCHANGE'
        return ogx,ch
        

def getSNDRre(k,txtname):
    import os
    fileDir = os.path.dirname(os.path.realpath('__file__'))
    filename = os.path.join(fileDir, 'txtfiles/'+txtname)
    f = open(filename, "r+")
    sxndlist0 = f.read()
    sxndlist = re.split('\n',sxndlist0)
    if k=="F":
        sxndlist=sxndlist[:-2]
    fullsreg=[]
    for x in sxndlist:
        if x[1]=="O": # solve overlap problem
            reg = "[˚\n][^a-z^\n]*" + x 
        else:
            reg = "[˚\n][^a-z^\n]*" + x + ".*\n+.*"
        rese=reg
        fullsreg.append(rese)
    strfsr='|'.join(fullsreg)
    return strfsr


def takeFofF(elem):
    for elems in elem:
        if type(elems[0]) == int:
            return elems[0]
        else:
            return int(0)
    return int(g[0])
def takeFirst(elem):
    return int(elem[0])
def takeSecond(elem):
    if type(elem[1]) == int:
        return int(elem[1])
    else:
        return int(0)
def takeFirst1(elem):
    if type(elem[0]) == int:
        return int(elem[0])
    else:
        return int(0)
def takeSec(elem):
    return elem[1]
def tolist(r):
        listr = []
        for key, value in r.items():
            k = (key,value)
            listr.append(k)
        return listr

def unpack(x):
    out=[]
    for lis in x:
        out.extend(lis)
    return out

def getreg(listofdepts):
    refs=[]
    for dept in listofdepts:
        bn1 = "[0-9]*_b[0-9]+_[0-9]+_[0-9]+_.*txt"
        ref = str(dept + bn1 + "|")
        refs.extend(ref)
    refs.pop()
    refss = ''.join(refs)
    return refss


def getHM(listpgs,cleanlist,utsfun,hmfun,deptlist): 
        Sdepts = []
        regex = getreg(deptlist)
        allx=[]
        for pg in listpgs:
            listTS, TSerrs = utsfun.getUnixTS(pg,"r") #1*
            listSo1,listSo = hmfun.findSenders(pg,cleanlist,0) #2*
            listto1,listto = hmfun.findTo(pg,cleanlist, 0)
            listCc1,listCc = hmfun.findCc(pg,cleanlist,0)#3
            listSub = hmfun.findSubjects(pg) #4*
            #regex = str('.*txt') # e.g. "dept.*txt"
            deptfile = re.findall(regex,pg) #0
            if deptfile == []:
                allx.append(deptfile)
            elif listTS == [] or listSo == []:
                allx.append(deptfile)
            else:
                Sdept = (deptfile[0],tuple(listTS),tuple(listSo),tuple(listto),tuple(listCc),tuple(listSub))
                Sdepts.append(Sdept)
                allx.append(deptfile)
                sdl = (str(len(allx)))+"/"+(str(len(listpgs)))
                pdl = "   " + str(round(len(allx)/len(listpgs)*100,2)) + '%'                           
                print(sdl+pdl,end="\r")
                #print(pdl,end="\r")
        return Sdepts