# assembly

## How to run it?
You just need to run the Main class, it will print the production lines.

## How to test a different input?
Change the values from `input.txt` file inside `src/main/resources/`. I did not know if it was necessary to receive an external file as input, so I used a default one.

## Warning
There is an [assertion at the unit test](https://github.com/cunhazera/assembly/blob/master/src/test/java/com/schedule/business/AssemblySchedulerTest.java#L24) that will fail if you change the number of production lines from the input test file.
