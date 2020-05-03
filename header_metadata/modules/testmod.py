def findsenders(emailstext):
    import re
    
    #From:
    froms = re.findall("From:.*[A-Za-z].*", emailstext)
    fromstr = '\n'.join(froms)
    def refroms(fromstr):
        fromstr_orgs = re.sub("From:\W","", fromstr) #with (ORG)
        fromstr_noendspace1 = re.sub("\s+\n","\n", fromstr_orgs)
        fromstr_noendspace2 = re.sub("\s$","",fromstr_noendspace1)
        return fromstr_noendspace2
    newfromstr = str(refroms(fromstr))
   
    #On...
    ons = re.findall("On.*wro[tf]e", emailstext)
    onstr = '\n'.join(ons)
    def reons(onstr):
        onstr1 = re.sub("On\s.*at\s[0-9]*:[0-9][0-9]\s[AP]M\W*","", onstr)
        onstr2 = re.sub("On\s.*\s[0-9]*","", onstr1)
        onstr3 = re.sub("[0-9]","",onstr2)
        onstr4 = re.sub("wrote","",onstr3)
        onstr_noendspace1 = re.sub("\s+\n","\n", onstr4)
        onstr_noendspace2 = re.sub("\s+$","", onstr_noendspace1)
        return onstr_noendspace2
    newonstr = str(reons(onstr))
    
    roughlist = []
    fromsenders = re.split('\n', newfromstr) #splits from str into list
    onsenders = re.split('\n',newonstr) #splits on... str into list
    #combines the two lists; roughlist contains names found in From: header and On... header
    roughlist.extend(onsenders)
    roughlist.extend(fromsenders)
    roughstr = '\n'.join(roughlist)
    
    ultimatelist = [] #creates final list for final sender names to be put into
    ultimatelist.clear()
    
    lastcommafirstdude = re.findall("[A-Za-z]+,\s[A-Za-z]+",roughstr)
    ultimatelist.extend(lastcommafirstdude)
    
    firstlast = re.findall("[A-Z][a-z]+.[A-Z][a-z][A-Za-z]*",roughstr)
    
    unwanted = {'Shekter Smith','Mary Beth','Tracy Jo','Snekter Smith','Shekier Smith'}
    firstlast1 = [e for e in firstlast if e not in unwanted]
    firstlaststring = '\n'.join(firstlast1)
    
    firstnames = re.findall('^[A-Z][a-z]+\s|\n[A-Z][a-z]+\s',firstlaststring)
    firstnames1 = ' '.join(firstnames)
    firstnames2 = re.sub("\n","",firstnames1)
    firstnameslist = re.split("\s+",firstnames2)
    firstnameslist.pop()

    lastnames1 = re.findall('.[A-Z][a-z]+',firstlaststring)
    lastnames2 = ''.join(lastnames1)
    lastnameslist = re.split('\s',lastnames2)
    del lastnameslist[0]

    for idx, value in enumerate(firstnameslist):
        key = lastnameslist[idx] + ", " + firstnameslist[idx]
        #print(key)
        ultimatelist.append(key)
    return(ultimatelist)
    print(ultimatelist)

def findreceivers(emailstext):
    import re
    
    #To:
    tos = re.findall("To:.*[A-Za-z].*", emailstext)
    tostr = '\n'.join(tos)
    
    ultimatelist_to = []
    ultimatelist_to.clear()
    
    lastcommafirst_to = re.findall("[A-Za-z]+,.[A-Za-z]+",tostr)
    ultimatelist_to.extend(lastcommafirst_to)

    firstlast_to0 = re.findall("[A-Z][a-z]+.[A-Z][a-z][A-Za-z]*",tostr)
    unwanted = {'Shekter Smith', 'Mary Beth','Tracy Jo','Snekter Smith','Shekier Smith'}
    firstlast_to = [e for e in firstlast_to0 if e not in unwanted]
    firstlast_to_str = '\n'.join(firstlast_to)
    
    firstnames_to = re.findall('^[A-Z][a-z]+\s|\n[A-Z][a-z]+\s',firstlast_to_str)
    firstnames1_to = ' '.join(firstnames_to)
    firstnames2_to = re.sub("\n","",firstnames1_to)
    firstnameslist_to = re.split("\s+",firstnames2_to)
    firstnameslist_to.pop()

    lastnames1_to = re.findall('.[A-Z][a-z]+',firstlast_to_str)
    lastnames2_to = ''.join(lastnames1_to)
    lastnameslist_to = re.split('\s',lastnames2_to)
    del lastnameslist_to[0]

    for idx, value in enumerate(firstnameslist_to):
        key_to = lastnameslist_to[idx] + ", " + firstnameslist_to[idx]
        ultimatelist_to.append(key_to) #adds these reformatted names to ultimatelist
        
    #Cc:
    Ccs = re.findall("Cc:.*[A-Za-z].*", emailstext)
    Ccstr = '\n'.join(Ccs)
    
    ultimatelist_Cc = []
    ultimatelist_Cc.clear()

    lastcommafirst_Cc = re.findall("[A-Za-z]+,.[A-Za-z]+",Ccstr)
    ultimatelist_Cc.extend(lastcommafirst_Cc)
    
    firstlast_Cc0 = re.findall("[A-Z][a-z]+.[A-Z][a-z][A-Za-z]*",Ccstr)
    unwanted = {'Shekter Smith', 'Mary Beth','Tracy Jo'}
    firstlast_Cc = [e for e in firstlast_Cc0 if e not in unwanted]
    firstlast_Cc_str = '\n'.join(firstlast_Cc)

    firstnames_Cc = re.findall('^[A-Z][a-z]+\s|\n[A-Z][a-z]+\s',firstlast_Cc_str)
    firstnames1_Cc = ' '.join(firstnames_Cc)
    firstnames2_Cc = re.sub("\n","",firstnames1_Cc)
    firstnameslist_Cc = re.split("\s+",firstnames2_Cc)
    firstnameslist_Cc.pop()

    lastnames1_Cc = re.findall('.[A-Z][a-z]+',firstlast_Cc_str)
    lastnames2_Cc = ''.join(lastnames1_Cc)
    lastnameslist_Cc = re.split('\s',lastnames2_Cc)
    del lastnameslist_Cc[0]

    for idx, value in enumerate(firstnameslist_Cc):
        key_Cc = lastnameslist_Cc[idx] + ", " + firstnameslist_Cc[idx]
        ultimatelist_Cc.append(key_Cc)
    
    
    ultimatelist_rec = []
    ultimatelist_rec.clear()

    ultimatelist_rec.extend(ultimatelist_to)
    ultimatelist_rec.extend(ultimatelist_Cc)

    return(ultimatelist_rec)
    print(ultimatelist_rec)
    
    
    
def findTos(emailstext):
    import re
    #To:
    tos = re.findall("To:.*[A-Za-z].*", emailstext)
    tostr = '\n'.join(tos)
    
    ultimatelist_to = []
    ultimatelist_to.clear()
    
    lastcommafirst_to = re.findall("[A-Za-z]+,.[A-Za-z]+",tostr)
    ultimatelist_to.extend(lastcommafirst_to)

    firstlast_to0 = re.findall("[A-Z][a-z]+.[A-Z][a-z][A-Za-z]*",tostr)
    unwanted = {'Shekter Smith', 'Mary Beth','Tracy Jo','Snekter Smith','Shekier Smith'}
    firstlast_to = [e for e in firstlast_to0 if e not in unwanted]
    firstlast_to_str = '\n'.join(firstlast_to)
    
    firstnames_to = re.findall('^[A-Z][a-z]+\s|\n[A-Z][a-z]+\s',firstlast_to_str)
    firstnames1_to = ' '.join(firstnames_to)
    firstnames2_to = re.sub("\n","",firstnames1_to)
    firstnameslist_to = re.split("\s+",firstnames2_to)
    firstnameslist_to.pop()

    lastnames1_to = re.findall('.[A-Z][a-z]+',firstlast_to_str)
    lastnames2_to = ''.join(lastnames1_to)
    lastnameslist_to = re.split('\s',lastnames2_to)
    del lastnameslist_to[0]

    for idx, value in enumerate(firstnameslist_to):
        key_to = lastnameslist_to[idx] + ", " + firstnameslist_to[idx]
        ultimatelist_to.append(key_to) #adds these reformatted names to ultimatelist
    return(ultimatelist_to)
     
    
def findCcs(emailstext):
    import re
    #Cc:
    Ccs = re.findall("Cc:.*[A-Za-z].*", emailstext)
    Ccstr = '\n'.join(Ccs)
    
    ultimatelist_Cc = []
    ultimatelist_Cc.clear()

    lastcommafirst_Cc = re.findall("[A-Za-z]+,.[A-Za-z]+",Ccstr)
    ultimatelist_Cc.extend(lastcommafirst_Cc)
    
    firstlast_Cc0 = re.findall("[A-Z][a-z]+.[A-Z][a-z][A-Za-z]*",Ccstr)
    unwanted = {'Shekter Smith', 'Mary Beth','Tracy Jo','Snekter Smith','Shekier Smith'}
    firstlast_Cc = [e for e in firstlast_Cc0 if e not in unwanted]
    firstlast_Cc_str = '\n'.join(firstlast_Cc)

    firstnames_Cc = re.findall('^[A-Z][a-z]+\s|\n[A-Z][a-z]+\s',firstlast_Cc_str)
    firstnames1_Cc = ' '.join(firstnames_Cc)
    firstnames2_Cc = re.sub("\n","",firstnames1_Cc)
    firstnameslist_Cc = re.split("\s+",firstnames2_Cc)
    firstnameslist_Cc.pop()

    lastnames1_Cc = re.findall('.[A-Z][a-z]+',firstlast_Cc_str)
    lastnames2_Cc = ''.join(lastnames1_Cc)
    lastnameslist_Cc = re.split('\s',lastnames2_Cc)
    del lastnameslist_Cc[0]

    for idx, value in enumerate(firstnameslist_Cc):
        key_Cc = lastnameslist_Cc[idx] + ", " + firstnameslist_Cc[idx]
        ultimatelist_Cc.append(key_Cc)
    return(ultimatelist_Cc)
    

    return(ultimatelist_rec)
    print(ultimatelist_rec) 
    
def findsubjects(emailstext):
    import re
    subjs0 = re.findall("Subject:.*[A-Za-z].*", emailstext)
    fullsubjstr = '\n'.join(subjs0)
    subjs1 = re.sub("[FfWwRr]+[EeWwDd]:","",fullsubjstr)
    subjs2 = re.findall("Subject:[\s]+(.*)",subjs1)
    return subjs2

def descSubjects(emailstext):
    import re
    print("- - - SUBJECT descriptives - - -")
    x = findsubjects(emailstext)
    print(str(len(x)) + " subjects.")
    print("subjects:")
    print(x)
    
def descSenders(emailstext):
    import re
    print("- - - SENDER descriptives - - -")

    listsenders = []
    listsenders.clear()
    listsenders.extend(findsenders(emailstext))
    froms = []
    ons = []
    froms.clear()
    ons.clear()
    froms = re.findall("From:.*[A-Za-z].*", emailstext)
    ons = re.findall("On.*wro[tf]e", emailstext)
    print((str(len(ons))) + " On...wrote sender lines. " + str(len(froms)) + " From: sender lines.")
    percent = str(round(((len(listsenders))/(len(ons) + len(froms))*100),2))
    print((str(len(ons) + len(froms))) + " total froms and ons vs. " + str(len(listsenders)) + " senders found (" + percent + "%)")
    fromsandonsnames = (len(ons)+len(froms))
    percentofons = (((len(ons)) / len(froms)) * 100)
    percentofonsr = round(percentofons,2)
    print(str(percentofonsr) + "% estimated to have an On...wrote header")
    print("")
    
    #obtaining list of least to most frequent names
    
    listsenders_u = list(dict.fromkeys(listsenders)) #list of unique names
    def namecounter(uniquenames,allnames):
        name_freq = []
        pair = ()
        for uname in uniquenames:
            if uname in allnames:
                number = allnames.count(uname)
                pair = (uname,number)
                name_freq.append(pair)
        return name_freq
        #print(len(name_freq))
    listname_freq = namecounter(listsenders_u,listsenders)
    #len(listname_freq)
    def takeSecond(elem):
        return int(elem[1])
    listname_freq.sort(key=takeSecond)
    
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
        #print(listname_freq)

    def fixallnames(listofunames):
        fixingnames("Smith,[Ll].*ne","Shekter Smith, Liane",listofunames)
        fixingnames("W.+fel,.B.*", "Wurfel, Brad",listofunames)
        fixingnames("W.+fel,.S.*", "Wurfel, Sara",listofunames)
        fixingnames("Fonger.*", "Fonger, Ronald",listofunames)
        fixingnames("Edw.*", "Edwards, Marc",listofunames)
        fixingnames("Benz.*", "Benzie, Richard",listofunames)
        #fixingnames(regex,correctname,listofunames)

    fixallnames(listsenders_u)
    print(str(len(listname_freq)) + " unique, fixed sender names.")
    print("")
    print("sender name, frequency:")
    print(listname_freq)
    
    
def descReceivers(emailstext):
    import re
    print("- - - RECEIVER descriptives - - -")
    print("i.d. = including duplicates")
    
    listreceivers = []
    listreceivers.clear()
    listreceivers.extend(findreceivers(emailstext))
    listTos = []
    listTos.clear()
    listTos.extend(findTos(emailstext))
    listCcs = []
    listCcs.clear()
    listCcs.extend(findCcs(emailstext))
    
    print(str(len(listreceivers)) + " receivers, i.d.")
    percentTo = str(round(((len(listTos))/(len(listreceivers))*100),2))
    percentCc = str(round(((len(listCcs))/(len(listreceivers))*100),2))
    print(str(len(listTos)) + " receivers in To: line i.d. (" + percentTo + "%)")
    print(str(len(listCcs)) + " receivers in Cc: line i.d. (" + percentCc + "%)")
    print("")
    
    #obtaining list of least to most frequent names
    
    listreceivers_u = list(dict.fromkeys(listreceivers)) #list of unique names
    
    def namecounter(uniquenames,allnames):
        name_freq = []
        pair = ()
        for uname in uniquenames:
            if uname in allnames:
                number = allnames.count(uname)
                pair = (uname,number)
                name_freq.append(pair)
        return name_freq
        
    listname_freq = namecounter(listreceivers_u,listreceivers)
    #print(listreceivers_u)
    def takeSecond(elem):
        return int(elem[1])
    listname_freq.sort(key=takeSecond)
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
        #print(listname_freq)

    def fixallnames(listofunames):
        fixingnames("Smith,[Ll].*ne","Shekter Smith, Liane",listofunames)
        fixingnames("W.+fe[l]*,.B.*", "Wurfel, Brad",listofunames)
        fixingnames("W.+fe[l]*,.S.*", "Wurfel, Sara",listofunames)
        fixingnames("Fonger.*", "Fonger, Ronald",listofunames)
        fixingnames("Edw.*", "Edwards, Marc",listofunames)
        fixingnames("Benz.*", "Benzie, Richard",listofunames)
        #fixingnames(regex,correctname,listofunames)
    
    fixallnames(listreceivers_u)
    print(str(len(listname_freq)) + " unique, fixed receiver names.")
    print("")
    print("receiver name, frequency:")
    print(listname_freq)
    
    
    
    
    
    
    
    
    
    
    
    


    

