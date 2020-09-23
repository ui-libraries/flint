# this module contains functions that involve pulling senders and receivers


# # # fixing names
import re
def fixallnames(x):
    import re
    def fixingnames(regex,rightname,listofunames):
        new = []
        ult = "\n".join(listofunames)
        error_names = re.findall(regex,ult)
        for name in listofunames:
            if name in error_names:
                new.append(rightname)
            elif name not in error_names:
                new.append(name)
        return new
    x=fixingnames("[Ss]m[ilt]+h[,.].[Ll].*ne","Shekter Smith, Liane",x)
    x=fixingnames("Sm[il]th[,.].S[hn]ek.[ae]r","Shekter Smith, Liane",x)
    x=fixingnames("W[A-Za-z]+e[l\!]*[,.].[S8B]radS*", "Wurfel, Brad",x)
    x=fixingnames("W[A-Za-z]+e[l\!]*[,.].Bra[tcqd][l]*", "Wurfel, Brad",x)
    x=fixingnames("Bra[dcl]*, Wurfel", "Wurfel, Brad",x)
    x=fixingnames("W[A-Za-z]+e[l\!]*[,.].Sara", "Wurfel, Sara",x)
    x=fixingnames("Fonge[rt].*", "Fonger, Ronald",x)
    x=fixingnames("Edw.*", "Edwards, Marc",x)
    x=fixingnames("Ben[z2].*", "Benzie, Richard",x)
    x=fixingnames("Benme.*", "Benzie, Richard",x)
    x=fixingnames(".*r[yv]s..*, M[li].+[el]", "Prysby, Mike",x)
    x=fixingnames("[Bb]us..[,.] [Ss]te.+", "Busch, Stephen",x)
    x=fixingnames("[Ss]te.+[,.] [Bb]us.*", "Busch, Stephen",x)
    x=fixingnames("Wy.+[,.] D.+", "Wyant, Dan",x)
    x=fixingnames(".*elen[,.] Mary", "Thelen, Mary Beth",x)
    x=fixingnames("Bet.[,.] Mary", "Thelen, Mary Beth",x)
    x=fixingnames("[BR].*l[.,][ -]Adam", "Rosenthal, Adam",x)
    x=fixingnames("Ros\w+[li][.,].A\w+m", "Rosenthal, Adam",x)
    x=fixingnames("Ostiund.*", "Ostlund, Peter",x)
    x=fixingnames("Hansen[.,][\s]*[lJ]e[fF]*","Hansen, Jeff",x)
    x=fixingnames("[RB]osenthal[,.] Adam","Rosenthal, Adam",x)
    x=fixingnames("S[yv][dg]o.*","Sygo, Jim",x)
    x=fixingnames("Creal[,.] W[il\|]+am","Creal, William",x)
    x=fixingnames("Matta[,.] Sam.r","Matta, Samir",x)
    x=fixingnames(".*Matta.*","Matta, Samir",x)
    x=fixingnames("Beach[,.] M.chae[l]*","Beach, Michael",x)
    x=fixingnames("Johnson[,.] D[A-Za-z]*","Johnson, Daugherty",x)
    x=fixingnames("E.mer R*[.,]* Hess[S \|,]*","Hess, Elmer",x)
    x=fixingnames("D*EQ-[Ll]*og[Ll]*Letter[SDT ]*[\|S]*","DEQ-LogLetter",x)
    x=fixingnames("Colle[tl]*[.,:] Joli","Collett, Joli",x)
    x=fixingnames("Sylves.er, Kevin","Sylvester, Kevin",x)
    x=fixingnames(".allone, Maggie","Pallone, Maggie",x)
    x=fixingnames("[,.] Kory.*","Groetsch, Kory",x)
    x=fixingnames("[R]*ob.nson, M[A-Za-z]*c[A-Za-z]*","Robinson, Michael",x)
    x=fixingnames("De[li]toral, M[A-Za-z\|]+","Deltoral, Miguel",x)
    x=fixingnames("M[A-Za-z\|]+,De[li]toral","Deltoral, Miguel",x)
    x=fixingnames("F[A-Za-z]*a, Christine","Flaga, Christine",x)
    x=fixingnames("Gra.am, Lois","Graham, Lois",x)
    x=fixingnames("Tru[A-Za-z]+[.,] Amanda","Trujillo, Amanda",x)
    x=fixingnames("[Cc]r..ks[.,]\s*[Jj][A-Za-z]+","Crooks, Jennifer",x)
    x=fixingnames("J[A-Za-z]+, Cr..ks[.,]","Crooks, Jennifer",x)
    x=fixingnames(".*M[Cc]Shane.*","McShane, Hilda",x)
    x=fixingnames("[HE][A-Za-z]+[li]ott, L[A-Za-z]+","Elliott, Larry",x)
    x=fixingnames("L[A-Za-z]+, E[li]+ott","Elliott, Larry",x)
    x=fixingnames("Scherbarth","Scherbarth, John",x)
    x=fixingnames("LeeWalters", "LeeWalters",x)
    x=fixingnames("Sk[a-z]+[.,] Adam", "Skubik, Adam",x)
    x=fixingnames("Bennett, C[hn][a-z]+", "Bennett, Charles",x)
    x=fixingnames("Levine, Pe.e", "Levine, Pete",x)
    x=fixingnames("Pack, Trac.e", "Pack, Tracie",x)
    x=fixingnames("N*Dever\w+[yx], Tracy", "Devereaux, Tracy Jo",x)
    x=fixingnames("\n*Tracy Jo Devereaux\n*.*", "Devereaux, Tracy Jo",x)
    x=fixingnames("\n*D*EQ-Legislative-Contact\n*.*", "DEQ-Legislative-Contact",x)
    x=fixingnames("Dan[a-z]+, Sharon", "Daniell, Sharon",x)
    x=fixingnames("Shek.er[x]*[.,] Jean", "Shekter, Jean",x)
    x=fixingnames("Balley, Shella", "Balley, Sheila",x)
    x=fixingnames("Banzie, Sichard", "Benzie, Richard",x)
    x=fixingnames("Bincstk, Robert", "Bincsik, Robert",x)
    x=fixingnames("CTroft, Howard", "Croft, Howard",x)
    x=fixingnames("Carrington, Davld", "Carrington, David",x)
    x=fixingnames("Crooks[,.] .[A-Za-z]+", "Crooks, Jennifer",x)
    x=fixingnames('DEQ[- ]Leg[A-Za-z]+[wv]e-Contact[SDT]*', "DEQ-Legislative-Contact",x)
    x=fixingnames("Dee[g‘Ir]*, [RB].[li]annon[S]*", "Dee, Rhiannon",x)
    x=fixingnames("D[li]+on, Andy", "Dillon, Andy",x)
    x=fixingnames("Fort[li]n, Denise", "Fortin, Denise",x)
    x=fixingnames("Hansen[,]* [A-Za-z]+", "Hansen, Jeff",x)
    x=fixingnames("Henrv, Ja[mrn]+es", "Henry, James",x)
    x=fixingnames("Lambr[li]n[li]dou, Yanna", "Lambrinidou, Yanna",x)
    x=fixingnames("Leav[it]+, And[yrew]+", "Leavitt, Andy",x)
    x=fixingnames("McGlohom, Greg", 'McGlohorn, Greg',x)
    x=fixingnames('Michae[!A-Za-z\]\[]* Gl.sgow[SDT]*', "Glasgow, Michael",x)
    x=fixingnames("Mlchael[,]* Roblnson", "Robinson, Michael",x)
    x=fixingnames("Mlguel, Deltoral,", "Deltoral, Miguel",x)
    x=fixingnames("Mon[ao]smi[tl]h, [GC]arrie", "Monosmith, Carrie",x)
    x=fixingnames("Po[vy], Thomas", "Poy, Thomas",x)
    x=fixingnames("R[eo]berts, Alan", "Roberts, Alan",x)
    x=fixingnames("'Ronald .*onger .*", "Fonger, Ronald",x)
    x=fixingnames("Sand[li]+n, Mary", "Sandlin, Mary",x)
    x=fixingnames('Yanna L. ambrinidou[SDT]*', "Lambrinidou, Yanna",x)
    x=fixingnames('Alexander, Mic', "Alexander, Michael",x)
    x=fixingnames('Pa[li!]*one, Maggie', "Pallone, Maggie",x)
    x=fixingnames('Mick[li]e, Bryn', "Mickle, Bryn",x)
    x=fixingnames('Creagh, K', "Creagh, Keith",x)
    x=fixingnames('Brown, E.gar', "Brown, Elgar",x)
    x=fixingnames('C[oc]*k,.Pat', "Cook, Pat",x)
    x=fixingnames('Crouse, Boger', "Crouse, Roger",x)
    x=fixingnames('Erya.y, M.ke', "Prsyby, Mike",x)
    x=fixingnames('Fausone, J', "Fausone, Jim",x)
    x=fixingnames('Gask[li]n, Jam[li]e ', "Gaskin, Jamie",x)
    x=fixingnames('Brown, E.gar', "Brown, Elgar",x)
    x=fixingnames('Mack, M\w*ssa', "Mack, Melissa",x)
    x=fixingnames('Benne, R\w*', "Benzie, Richard",x)
    x=fixingnames('dee,Rhiannon', "Dee, Rhiannon",x)
    x=fixingnames('en, Mary', "Thelen, Mary Beth",x)
    x=fixingnames('Devereaux,.*', "Devereaux, Tracy",x)
    x=fixingnames('Pal[li]one,.*', "Pallone, Maggie",x)
    x=fixingnames('sacknder,sarah', "Sackrider, Sarah",x)
    x=fixingnames('Tharp,\s*Ed[ward]*', "Tharp, Ed",x)
    x=fixingnames('Heather, Feuerstem', "Feuerstein, Heather",x)
    x=fixingnames('Hertel, El', "Hertel, Elizabeth",x)
    x=fixingnames('ith, Carrie', "Monosmith, Carrie",x)
    x=fixingnames('K\w+an, George', "Krisztian, George",x)
    x=fixingnames('Krisztian, G', "Krisztian, George",x)
    x=fixingnames('George, K\w+an', "Krisztian, George",x)
    x=fixingnames('Maggle, Pallone', "Pallone, Maggie",x)
    x=fixingnames('mczyk, Lynne', "Adamczyk, Lynne",x)
    x=fixingnames('Miguel, Delboral', "Deltoral, Miguel",x)
    x=fixingnames('n, Jeff', "Hansen, Jeff",x)
    x=fixingnames('nthal, Ad', "Rosenthal, Adam",x)
    x=fixingnames('P[wry]+sb*[ywv],.*', "Prysby, Mike",x)
    x=fixingnames('Qagish, Awn', "Qaqish, Awni",x)
    x=fixingnames('R, Hess', "Hess, Elmer",x)
    x=fixingnames('Sm\w*, S[hn]\w*r', "Shekter Smith, Liane",x)
    x=fixingnames('Sm.th, [lwLsi]\w*', "Shekter Smith, Liane",x)
    x=fixingnames('S[vy]\w+er, Kevin', "Sylvester, Kevin",x)
    x=fixingnames('Th\w+en, M\w+y', "Thelen, Mary Beth",x)
    x=fixingnames('th, Liane', "Shekter Smith, Liane",x)
    x=fixingnames('Dan, Wyant', "Wyant, Dan",x)
    x=fixingnames('y, James', "Henry, James",x)
    x=fixingnames('Gask.n, Jamie', "Gaskin, Jamie",x)
    x=fixingnames('Mary, Thelen', "Thelen, Mary Beth",x)
    x=fixingnames('Raysin, Matthew', "Raysin, Matt",x)
    x=fixingnames('[Benn]*e, Rlchard', "Benzie, Richard",x)
    x=fixingnames('Taft, James', "Taft, Jim",x)
    x=fixingnames('Mlguel, Deltoral', "Deltoral, Miguel",x)
    x=fixingnames("[Ss]mi*th, [Lli]+ane", "Shekter, Smith, Liane",x)
    x=fixingnames(".*Moste", "Moste, Lea",x)
    x=fixingnames("Thelen, Mary", "Thelen, Mary Beth",x)
    x=fixingnames("Wright, Mike", "Wright, Michael",x)
    x=fixingnames('Busch.*', "Busch, Stephen",x)
    x=fixingnames("Collet.*", "Collett, Joli",x)
    x=fixingnames("Creal.*", "Creal, William",x)
    x=fixingnames(".*R.iannon.*", "Dee, Rhiannon",x)
    x=fixingnames("Deltoral.*", "Deltoral, Miguel",x)
    x=fixingnames('.*Devereaux.*', "Devereaux, Tracy Jo",x)
    x=fixingnames(".*Pallone.*", "Pallone, Maggie",x)
    x=fixingnames(".*Tharp.*", "Tharp, Ed",x)
    x=fixingnames(".*Glasgow.*", "Glasgow, Michael",x)
    x=fixingnames(".*Guye[lt]*e.*", "Guyette, Curt",x)
    x=fixingnames('.*Cr..ks.*', "Crooks, Jennifer",x)
    x=fixingnames(".*Sygo.*", "Sygo, Jim",x)
    x=fixingnames(".*Tharp.*", "Tharp, Ed",x)
    x=fixingnames(".*Malia.*", "O'Malia, John",x)
    x=fixingnames(".*Daugher.*", "Johnson, Daugherty",x)
    x=fixingnames(".*[Ll]iane.*", "Shekter Smith, Liane",x)
    x=fixingnames(".*Gardner.*", "Gardner, Michael",x)
    x=fixingnames(".*Graham.*", "Graham, Lois",x)
    x=fixingnames("M\w+, Cor\w+ne", "Miller, Corinne",x)
    x=fixingnames(".*Moste.*", "Moste, Lea",x)
    x=fixingnames(".*Ronald.*", "Fonger, Ronald",x)
    x=fixingnames(".*Ros.nthal.*", "Rosenthal, Adam",x)
    #fixingnames(regex,correctname,listofunames)
    return x

def stdize(listofnames):
    import re
    ultimatelist = []
    ultimatelist2 = []
    for name in listofnames:
        lastcommafirstdude = re.findall("[A-Za-z][A-Za-z][A-Za-z]+[,.][- ][A-Z][A-Za-z][A-Za-z]+",name)
        firstlast = re.findall("[A-Z][a-z][A-Za-z]+[^\n.,-_A-Za-z][A-Z][']*[a-z]*[A-Za-z][a-z]+",name)
        if lastcommafirstdude != []:
            lcf = lastcommafirstdude[0]
            lcf = re.sub("[.]",",",lcf)
            ultimatelist.append(lcf)
        elif firstlast != []:
            # extracts sender lines formatted in [First Last]
            allflnames = re.findall('[A-Z][a-z][A-Za-z]+',name)
            #LIST OF FIRST NAMES
            firstnames = re.findall('^[A-Z][a-z]+\s|\n[A-Z][a-z]+\s',name)
            firstnames1 = ' '.join(firstnames)
            firstnames2 = re.sub("\n","",firstnames1)
            firstnameslist = re.split("\s+",firstnames2)
            firstnameslist.pop()
            #LIST OF LAST NAMES
            lastnames1 = re.findall('.[A-Z\'a-z]+',name)
            lastnames2 = ''.join(lastnames1)
            lastnameslist = re.split('\s',lastnames2)
            del lastnameslist[0]
            glist = []
            for idx, value in enumerate(firstnameslist):
                key = lastnameslist[idx] + ", " + firstnameslist[idx]
                #print(key)
                glist.append(key) #adds these reformatted names to ultimatelist
            if glist != []:
                ultimatelist.append(glist[0])
            else:
                pass
        elif firstlast == [] and lastcommafirstdude == []:
            if name == '\nS' or name == '\nD' or name == '\nT':
                name = re.sub('\n.','NOSENDER',name)
                ultimatelist.append(name)
                
            else:
                name = re.sub('\n[SDT][^\w]','',name)
                name = re.sub('\n','',name)
                ultimatelist.append(name)
               
    return ultimatelist

# # # # # getting clean list

def getCleanlist(emailstext):
    s = findRawSenders(emailstext,'no')
    r = findRawReceivers(emailstext,'no')
    sr = list(s + r)
    dsr = list(dict.fromkeys(sr))
    fsr = freqsnum(sr,1)
    #fsr10 = freqsnum(sr,10)
    goods = []
    for fs in fsr:
        goods.append(fs[0])
    sibs=[]
    import difflib
    for name in sr:
        correctname = difflib.get_close_matches(name,goods,8,0.9)
        if correctname!=[]:
            sibs.append(correctname)
    sibs2=[]
    for listnms in sibs:
        listnms.sort()
        tupnms = tuple(listnms)
        sibs2.append(tupnms)
    dsibs2 = list(dict.fromkeys(sibs2)) # list of sibs, might be the same
    dsibs2.sort()
    dsall2=[]
    for d in dsibs2:
        dsall2.extend(d) # list of all names in families
    winners = []
    hm =[]
    for tupnms in dsibs2:
        nmvals=[]
        listvals=[]
        for nm in tupnms:
            for tup in fsr:
                if nm == tup[0]: # pull freq of sib name from fturs
                    val = tup[1]
                    nmval = (nm,val)
                    listvals.append(val)
                    nmvals.append(nmval)
                    maxnm = max(listvals) 
        for nm in tupnms:
            if sr.count(nm) == maxnm: # whichever sib name has the highest freq
                winners.append(nm) # it is the winner of the group
            else:
                hm.append(nm) # losers
    winners.sort()
    winners
    winners1=[]
    for nm in winners:
        if nm not in hm: # a winner cannot be a loser
            winners1.append(nm)
    return winners1

# # # # # getting receivers

def findRawReceivers(emailstext,cleanlist):
    import re
    roughlist=[]
    to = []
    ultimatelist=[]
    receiverlist1 = re.findall("\n.*To[:;]+.*\n+.*C[ec][:;]+.*|\n.*To[:;]+.*|.*On.*wro[ft]e.",emailstext)
    receiverlist = re.findall("\n.*To[:;]+.[A-Za-z].*|\n.*C[ec][:;]+.[A-Za-z].*|.*On.*wro[ft]e.",emailstext)
    for things in receiverlist1:
        ultimatelist_Cc = []
        ultimatelist_to = []
        ultimatelist_on = []
        ultimatelist_rec = []
        tos = re.findall("[\W]*To[:;]+.[A-Za-z].*", things)
        Ccs = re.findall("[\W]*C[ec][:;]+.[A-Za-z].*", things)
        ons = re.findall(".*On.*wro[ft]e.",things)
        if Ccs != []:
            ultimatelist_Cc =stdize(Ccs)
        if tos != []:
            ultimatelist_to =stdize(tos)
            to.append(ultimatelist_to)
        elif ons != []:
            #ultimatelist_on.append("NOREC")
            pass
        if ultimatelist_to != []:
            ultimatelist_rec.extend(ultimatelist_to)
        if ultimatelist_Cc != []:
            ultimatelist_rec.extend(ultimatelist_Cc)
        senderz =fixallnames(ultimatelist_rec)
        roughlist.extend(senderz)
        
        roughlist2 = []
        for names in roughlist:
            if names != '' or names != ',':
                names = re.sub("To[:;]*[\s]*","",names)
                names = re.sub("C[ec][:;]*[\s]*","",names)
                roughlist2.append(names)
        roughlist3=stdize(roughlist2)
        roughlist4=[]
        for things in roughlist3:
            roughlist4.append(things)
    roughlist5=fixallnames(roughlist4)
    import difflib
    if cleanlist == 'no':
        return roughlist5
    else:
        for rec in roughlist5:
            correctname = difflib.get_close_matches(rec,cleanlist,8,0.9)
            g=[]
            if correctname !=[]:
                g.append(correctname[0])
                pass
            else:
                g.append(rec)
                pass
            ultimatelist.extend(g)
        return ultimatelist
# # # 

def findTo(emailstext,cleanlist):
    import re
    ultimatelist_rec = []
    receiverlist = re.findall("\n.*To[:;]+.*|.*On.*wro[ft]e.",emailstext) #all To: in chunk
    for things in receiverlist: #for each To:
        ultimatelist_to1=[]
        ultimatelist_to = []        
        tos = re.findall("[\W]*To[:;]+.*", things) #list of names
        ons = re.findall(".*On.*wro[ft]e.",things)
        if tos != []:
            ultimatelist_to = stdize(tos)
            if cleanlist == 'no':
                ultimatelist_to1 = fixallnames(ultimatelist_to)
            else:
                ultimatelist_to0 = fixallnames(ultimatelist_to)
                import difflib
                g=[]
                for rec in ultimatelist_to:
                    correctname = difflib.get_close_matches(rec,cleanlist,8,0.9)
                    
                    if correctname !=[]:
                        g.append(correctname[0])
                        pass
                    else:
                        g.append(rec)
                        pass
                    ultimatelist_to1.extend(g)
        elif ons != []:
            ultimatelist_to1.append("NOREC")
        if ons == [] and ultimatelist_to == [] and tos != []:
            ultimatelist_to1.append("NOTO")
        ultimatelist_rec.append(tuple(ultimatelist_to1))
    ultimatelist_rec0=[]
    for names in ultimatelist_rec:
        ns = []
        for n in names:
            n = re.sub("To[:;]+[\s]*","",n)
            ns.append(n)
        ultimatelist_rec0.append(tuple(ns))
    final=[]
    for u in ultimatelist_rec0:
        u = fixallnames(u)
        final.append(u)
    return tuple(final)
    #return ultimatelist_to1


def findCc(emailstext,cleanlist):
    import re
    ultimatelist_rec = []
    
    receiverlist = re.findall("\n.*To[:;]+.*\n+.*C[ec][:;]+.*|\n.*To[:;]+.*|.*On.*wro[ft]e.",emailstext)
    for things in receiverlist:
        ultimatelist_Cc = []
        ultimatelist_Cc2=[]
        Ccs = re.findall("C[ec]+[:;]+(.+)", things)
        ons = re.findall(".*On.*wro[ft]e.",things)
        if ons == []:
            if Ccs != []:
                if len(Ccs[0]) >= 3:
                    ultimatelist_Cc = stdize(Ccs)
                    if cleanlist == 'no':
                        ultimatelist_Cc1 = fixallnames(ultimatelist_Cc)
                        ultimatelist_Cc2.extend(ultimatelist_Cc1)
                    else:
                        ultimatelist_Cc0 = fixallnames(ultimatelist_Cc)
                        import difflib
                        for rec in ultimatelist_Cc:
                            correctname = difflib.get_close_matches(rec,cleanlist,8,0.9)
                            g=[]
                            if correctname !=[]:
                                g.append(correctname[0])
                                pass
                            else:
                                g.append(rec)
                                pass
                            ultimatelist_Cc2.extend(g)
                else:
                    ultimatelist_Cc2.append("NOCc")
            elif Ccs == []:
                ultimatelist_Cc2.append("NOCc")  
        elif ons != []:
            ultimatelist_Cc2.append("NOREC")
        ultimatelist_rec.append(tuple(ultimatelist_Cc2))
    ultimatelist_rec0=[]
    for names in ultimatelist_rec:
        ns = []
        for n in names:
            n = re.sub("C[ec][:;]+[\s]*","",n)
            ns.append(n)
        ultimatelist_rec0.append(tuple(ns))
    final=[]
    for u in ultimatelist_rec0:
        u = fixallnames(u)
        final.append(u)
    return tuple(final)


# # # # # getting senders

def findRawSenders(emailstext, cleanlist):
    import re
    fixede = []
    roughlist5=[]
    roughlist4=[]
    ultimatelist = []
    senderlist = re.findall("\n.*[FK]rom.*\n+\W*.|.*On.*wro[ft]e.",emailstext)
    for things in senderlist:
        roughlist = []
        froms = []
        newfroms = []
        froms = re.findall("\n\W*[FK]rom.*\n+\W*[SDT]", things)
        def refroms(fromstr):
            fromstr_orgs = re.sub("[FK]rom[:;.-]*\W","", fromstr) #with (ORG)
            fromstr_noorgs = re.sub("[\[\<\(].*","",fromstr_orgs)
            fromstr_noendspace1 = re.sub("\s+\n","\n", fromstr_noorgs)
            fromstr_noendspace2 = re.sub("\s$","",fromstr_noendspace1)
            return fromstr_noendspace2
        for fro in froms:
            f = refroms(fro)
            newfroms.append(f)
        ons = re.findall("On.*wro[tf]e[:;\n]", things)
        newons = []
        def reons(onstr):
            onstr1 = re.sub("On.*[AP]M\W*","", onstr)
            onstr1aa = re.sub("On.*2[01][0-9][0-9]","", onstr1)
            onstr1a = re.sub("[\[\<\(].*","",onstr1aa)
            #onstr2 = re.sub("On\s.*\s[0-9]*","", onstr1a)
            onstr3 = re.sub("[0-9]","",onstr1a)
            onstr4 = re.sub("wro[tf]e","",onstr3)
            onstr_noendspace1 = re.sub("\s+\n","\n", onstr4)
            onstr_noendspace2 = re.sub("\s+$","", onstr_noendspace1)
            return onstr_noendspace2
        for on in ons:
            o = reons(on)
            newons.append(o)
        if newons != []:
            roughlist.append(newons[0])
        if newfroms != []:
            roughlist.append(newfroms[0])
        roughlist2 = []
        for names in roughlist:
            if names != '' or names != ',':
                roughlist2.append(names)
        roughlist3=stdize(roughlist2)
        
        for d in roughlist3:
            roughlist4.append(d)
    roughlist5=fixallnames(roughlist4)
    if cleanlist == 'no':
        return roughlist5
    else:
        g=[]
        import difflib
        for sen in roughlist5:
            correctname = difflib.get_close_matches(sen,cleanlist,8,0.9)
            if correctname !=[]:
                g.append(correctname[0])
                pass
            else:
                g.append(sen)
                pass
        ultimatelist.extend(g)
    return ultimatelist
























def longpg(deqct_pg,num):
    import re
    longfiles = []
    ldeqct = []
    longfiles.clear()
    for pgs in deqct_pg:
        deqf = pgs[0]
        m1 = re.findall("deq[0-9][0-9]_b[0-9]+_([0-9]+)_[0-9]+_[0-9]+.txt",deqf)
        m2 = re.findall("deq[0-9][0-9]_b[0-9]+_[0-9]+_([0-9]+)_[0-9]+.txt",deqf)
        if int(m2[0]) - int(m1[0]) > num:
            longfiles.append(pgs)
    for file in longfiles:
        if file[1] == [] and file[2] == []:
            pass
        else:
            ldeqct.append(file)
    return ldeqct

def shortbm(deqct_bm,num):
    import re
    def short(listo):
        g = []
        for tups in listo:
            if len(tups[1]) < num:
                g.append(tups)
        return g
    sdeqct = short(deqct_bm)
    return sdeqct

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
def tolist(r):
        listr = []
        for key, value in r.items():
            k = (key,value)
            listr.append(k)
        return listr

def resortbyUTS(listx):
    import re
    # makes it so len(UTS) and len(Senders) is the same
    def insertblanks(ab): 
        good = []
        good.clear()
        goody = []
        for abz in ab:
            if len(abz[1]) == len(abz[2]):
                good.append(abz)
            elif len(abz[1]) > len(abz[2]):
                d = len(abz[1]) - len(abz[2]) #difference
                s = abz[2]
                for x in range(d):
                    s.append('')
                newabz = (abz[0],abz[1],s)
                good.append(newabz)
            elif len(abz[1]) < len(abz[2]):
                d = len(abz[2]) - len(abz[1]) #difference
                s = abz[1]
                for x in range(d):
                    s.append(0)
                newabz = (abz[0],s,abz[2])
                good.append(newabz)

        if len(good)/len(ab) == 1:
            return good
        else:
            print("ERROR:" + str(len(good)/len(ab)))

    #input list of items, where item = (deqbookmark_X,listofRunixTS,listofRufSenders)
    #output list of items, where item = (deqbookmark_X, RunixTS[i], RufSender[i])        
    def enum(good):
        newy2 = []
        for abz in good:
            tss = abz[1]
            sndrs = abz[2]
            o = len(tss)
            p = len(sndrs)
            for x in range(o):
                g = (abz[0],tss[x],[sndrs[x]])
                newy2.append(g)

        newy2.sort(key=takeSecond)
        return newy2
    def rearrange(d_u_s):
        newlist = []
        ndl = {}
        ndl.clear()
        new = []
        for tups in d_u_s:
            deqf = tups[0]
            uts = tups[1]
            sndr = tups[2]
            if uts == 0:
                ntup = (uts,sndr[0],deqf)
                new.append(ntup)
            else:
                #sndr = tups[2]
                uts_sndr = (uts,sndr[0],deqf) #sndr[0])
                new.append(uts_sndr)
        newd = list(dict.fromkeys(new)) #right ref list
        newd.sort(key=takeFirst1)        
        return newd
    def combine(u_s_d):
        ndl = {}
        nts = []
        for tups in u_s_d:
            if tups[0] != "NOTIMESTAMP":
                us = (tups[0],tups[1])
                deqf = tups[2]
                deqflist = [deqf]

                newdic = {}
                if us not in [*ndl]:
                    newdic[us] = deqflist
                    ndl.update(newdic)
                else:
                    ndl[us].append(deqf)
                    pass
            else:
                tups1 = ((tups[0],tups[1]),[tups[2]])
                nts.append(tups1)
        lndl = tolist(ndl)
        lndl.extend(nts)
        return lndl
    
    p = (combine(rearrange(enum(listx))))
    p.sort(key=takeFofF)
    return p

def mergesame(u_s_d):
    ndl = {}
    nts = []
    for tups in u_s_d:
        us = tups[0]
        deqf = tups[1]
        if us[0] != "NOTIMESTAMP":
            newdic = {}
            if us not in [*ndl]:
                newdic[us] = deqf
                ndl.update(newdic)
            else:
                ndl[us].extend(deqf)
                pass
        else:
            nts.append(tups)
    lndl = tolist(ndl)
    lndl.extend(nts)
    lndl.sort(key=takeFofF)
    return lndl


def freqsnum(x,num): #gets names of everyone mentioned <num> or more times
    def freqoveri(lista,num):
        newlistfreq = []
        for thing in lista:
            if thing[1] >= int(num):
                newlistfreq.append(thing)
            else:
                pass
        return newlistfreq
    f = freqsnames(x)
    return freqoveri(f,num)
def freqsnames(listthings):
    import re
    #obtaining list of least to most frequent names
    listthings_u = list(dict.fromkeys(listthings)) #list of unique names
    def namecounter(uniquenames,allnames):
        name_freq = []
        pair = ()
        for uname in uniquenames:
            if uname in allnames:
                number = allnames.count(uname)
                pair = (uname,number)
                name_freq.append(pair)
        return name_freq
    def takeSecond(elem):
        return int(elem[1])
    # fixing names with OCR errors
    def fixingnames(regex,rightname,listofunames):
        ult = "\n".join(listofunames)
        error_names = re.findall(regex,ult)
        error_numbs = []
        for toop in listname_freq:
            if toop[0] in error_names:
                n = toop[1]
                error_numbs.append(n)
            else:
                continue
        totalerror_names = sum(error_numbs)
        rightname = [rightname,totalerror_names]
        rightnamet = tuple(rightname)
        for toop in listname_freq:
            if toop[0] in error_names:
                listname_freq.remove(toop)
        listname_freq.append(rightnamet)
        listname_freq.sort(key=takeSecond)
    listname_freq = namecounter(listthings_u,listthings)
    #taking out fixed names ^ with 0 hits, to avoid e.g. ("Edwards, Marc", 0)
    listname_freq1 = []
    for item in listname_freq:
        if item[1] == 0:
            listname_freq.remove(item)
        elif item[1] > 0:
            listname_freq1.append(item)
    listname_freq1.sort(key=takeSecond)
    return listname_freq1



