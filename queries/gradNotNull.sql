SELECT * 
FROM public."Players" as players
INNER JOIN public."UTREntries" as utrEntries 
ON utrEntries."utrProfileId"=players."utrProfileId"
WHERE "gradClassName" is not null ;