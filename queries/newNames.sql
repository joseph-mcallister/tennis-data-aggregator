SELECT * 
FROM public."Players" as players
INNER JOIN public."UTREntries" as utrEntries 
ON utrEntries."utrProfileId"=players."utrProfileId"
WHERE players."createdAt" >= '2020-07-01';