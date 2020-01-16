package com.schedule.business;

import org.hamcrest.Matchers;
import org.junit.Test;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.List;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;

public class AssemblySchedulerTest {

    private AssemblyScheduler scheduler = new AssemblyScheduler();

    @Test
    public void testUsingTempFolder() throws IOException, URISyntaxException {
        List<String> lines = scheduler.createProductionLines();
        assertThat(lines.get(lines.size() - 1), equalTo("16:05 Ginastica Laboral"));
        assertThat(lines.get(1), equalTo("09:00 Cutting of steel sheets"));
        assertThat(lines.indexOf("12:00 Almoço"), Matchers.not(-1));
    }

}
